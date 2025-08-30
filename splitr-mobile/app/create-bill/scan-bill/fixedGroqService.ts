import * as FileSystem from 'expo-file-system';
import Constants from 'expo-constants';
import { OCRLearningSystem, LearningData } from './ocrLearningSystem';

export interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  discount?: number;
}

export interface OCRResult {
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxPercentage: number;
  serviceCharge: number;
  serviceChargePercentage: number;
  total: number;
  confidence: number;
  rawText: string;
  provider: string;
}

export class FixedGroqService {
  static readonly API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || Constants.expoConfig?.extra?.EXPO_PUBLIC_GROQ_API_KEY;
  static readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  static lastRequestTime = 0;
  static readonly MIN_REQUEST_INTERVAL = 2000;

  static async processReceipt(imageUri: string): Promise<OCRResult> {
    console.log('Fixed Groq: Starting receipt OCR processing:', imageUri);
    
    // Check API key availability
    if (!this.API_KEY || this.API_KEY.trim() === '') {
      throw new Error('GROQ_API_KEY not found in environment variables. Please check your .env file.');
    }
    
    console.log('Fixed Groq: API Key length:', this.API_KEY?.length);
    console.log('Fixed Groq: API Key preview:', this.API_KEY ? `${this.API_KEY.substring(0, 15)}...` : 'NOT FOUND');
    console.log('Fixed Groq: API URL:', this.API_URL);
    
    const startTime = Date.now();
    
    try {
      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.lastRequestTime = Date.now();

      // Convert image to base64
      const base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Fixed Groq: Image converted, size:', Math.round(base64Image.length / 1024), 'KB');

      // Call Groq API with new model and format
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`,
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: await this.createReceiptPrompt()
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          temperature: 0.1,
          max_completion_tokens: 1024,
          top_p: 0.9,
          stream: false,
          stop: null
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Fixed Groq: API Error:', response.status, errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const apiResult = await response.json();
      console.log('Fixed Groq: API Response received');

      const content = apiResult.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from Groq');
      }

      console.log('Fixed Groq: Raw response:', content);
      const result = this.parseResponse(content);
      
      // Store learning data for continuous improvement
      const learningData: LearningData = {
        imageUri,
        actualResult: result,
        confidence: result.confidence,
        timestamp: Date.now(),
        success: result.items.length > 0 && result.confidence > 0.5
      };
      
      // Store asynchronously without blocking
      OCRLearningSystem.storeLearningData(learningData).catch(err => 
        console.warn('Failed to store learning data:', err)
      );
      
      console.log(`Fixed Groq: Processing completed in ${Date.now() - startTime}ms`);
      return result;

    } catch (error) {
      console.error('Fixed Groq: Processing failed:', error);
      throw error;
    }
  }

  static async createReceiptPrompt(): Promise<string> {
    // Get improved prompt based on learning data
    const learningPrompt = await OCRLearningSystem.generateImprovedPrompt();
    
    return `${learningPrompt}

Analisis gambar struk/receipt Indonesia ini dengan teliti dan ekstrak informasi berikut:

TUGAS:
1. Baca semua teks pada struk
2. Identifikasi nama pesanan/item makanan/minuman
3. Temukan harga per item dan quantity
4. Deteksi diskon per item (jika ada)
5. Cari pajak/tax/PPN dengan persentase
6. Cari service charge/biaya layanan dengan persentase
7. Hitung subtotal, total diskon, pajak, service charge, dan total akhir

CONTOH PARSING:
- "Nasi Goreng 25.000" → name="Nasi Goreng", price=25000, quantity=1, discount=0
- "2x Es Teh @ 8.000 = 16.000" → name="Es Teh", price=8000, quantity=2, discount=0
- "Ayam Bakar (Diskon 10%) 27.000" → name="Ayam Bakar", price=30000, quantity=1, discount=3000
- "Pajak: 5.000" atau "PPN 10%: 5.000" → tax=5000 (abaikan %)
- "Service Charge: 3.750" atau "Layanan 7.5%: 3.750" → serviceCharge=3750 (abaikan %)

PRIORITAS PEMBACAAN:
1. FOKUS pada NOMINAL/JUMLAH pajak dan service charge, BUKAN persentase
2. Cari angka setelah kata "Pajak", "PPN", "Tax", "Service", "Layanan"
3. Persentase akan dihitung otomatis dari nominal
4. Jika item tidak jelas, estimasi dari subtotal - item lain

FORMAT OUTPUT (JSON KETAT):
{
  "items": [
    {
      "name": "nama_item_exact",
      "price": harga_per_unit_sebelum_diskon,
      "quantity": jumlah_item,
      "discount": diskon_per_item_atau_0
    }
  ],
  "subtotal": total_sebelum_diskon_dan_pajak,
  "discount": total_semua_diskon,
  "tax": jumlah_pajak,
  "taxPercentage": 0,
  "serviceCharge": jumlah_service_charge,
  "serviceChargePercentage": 0,
  "total": subtotal_minus_diskon_plus_pajak_plus_service_charge,
  "confidence": tingkat_kepercayaan_0_sampai_1
}

ATURAN PENTING:
- Jika tidak ada item terdeteksi, kembalikan items: []
- Price = harga per unit SEBELUM diskon
- Discount = jumlah potongan harga (angka positif)
- Hapus "Rp", ".", "," dari angka
- Confidence: 0.9+ jika jelas, 0.7+ jika cukup jelas, 0.5+ jika kurang jelas

Berikan HANYA JSON, tanpa teks tambahan.`;
  }

  static parseResponse(content: string): OCRResult {
    try {
      // Clean and extract JSON more robustly
      let jsonText = content.trim();
      
      // Remove markdown code blocks
      jsonText = jsonText.replace(/```json\s*/gi, '').replace(/```\s*/g, '');
      
      // Find JSON object boundaries with better validation
      const startIndex = jsonText.indexOf('{');
      if (startIndex === -1) {
        throw new Error('No JSON object start found');
      }
      
      // Find matching closing brace by counting braces
      let braceCount = 0;
      let endIndex = -1;
      for (let i = startIndex; i < jsonText.length; i++) {
        if (jsonText[i] === '{') braceCount++;
        if (jsonText[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }
      }
      
      if (endIndex === -1) {
        throw new Error('No matching closing brace found');
      }
      
      jsonText = jsonText.substring(startIndex, endIndex + 1);
      
      // Clean up common OCR artifacts that break JSON
      jsonText = jsonText.replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Remove control characters
      jsonText = jsonText.replace(/\\n/g, ' '); // Replace escaped newlines
      jsonText = jsonText.replace(/\\t/g, ' '); // Replace escaped tabs
      jsonText = jsonText.replace(/\\r/g, ''); // Remove carriage returns
      
      // Fix trailing commas
      jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');
      
      // Fix unescaped quotes in strings
      jsonText = jsonText.replace(/"([^"]*?)"([^":,}\]]*?)"([^":,}\]]*?)"/g, '"$1$2$3"');
      
      // Fix mathematical expressions and malformed values
      jsonText = jsonText.replace(/"(\w+)":\s*([0-9+\s*\-*/]+)([,}])/g, (match, key, expr, suffix) => {
        try {
          const cleanExpr = expr.replace(/\s/g, '').replace(/[^0-9+\-*/]/g, '');
          if (/^[0-9+\-*/]+$/.test(cleanExpr) && cleanExpr.length > 0) {
            const result = Function('"use strict"; return (' + cleanExpr + ')')();
            return `"${key}": ${result}${suffix}`;
          }
          const numberMatch = expr.match(/(\d+)/);
          if (numberMatch) {
            return `"${key}": ${numberMatch[1]}${suffix}`;
          }
          return `"${key}": 0${suffix}`;
        } catch {
          return `"${key}": 0${suffix}`;
        }
      });

      console.log('Fixed Groq: Parsing JSON:', jsonText.substring(0, 200) + '...');
      
      // Validate JSON structure before parsing
      if (!this.isValidJSON(jsonText)) {
        throw new Error('Invalid JSON structure detected');
      }
      
      const parsed = JSON.parse(jsonText);
      
      if (parsed && typeof parsed === 'object' && parsed.hasOwnProperty('items') && Array.isArray(parsed.items)) {
        const validItems: OrderItem[] = [];
        parsed.items.forEach((item: any) => {
          if (item.name && typeof item.price === 'number' && item.price > 0) {
            validItems.push({
              name: String(item.name).trim(),
              price: Number(item.price),
              quantity: Math.max(1, Number(item.quantity) || 1),
              discount: Math.max(0, Number(item.discount) || 0)
            });
          }
        });

        const subtotal = Number(parsed.subtotal) || validItems.reduce((sum, item) => 
          sum + (item.price * item.quantity), 0);
        const discount = Number(parsed.discount) || validItems.reduce((sum, item) => 
          sum + (item.discount || 0), 0);
        
        // Enhanced tax and service charge calculation - prioritize amounts over percentages
        let tax = Math.max(0, Number(parsed.tax) || 0);
        let serviceCharge = Math.max(0, Number(parsed.serviceCharge) || 0);
        
        // Always calculate percentages from amounts for accuracy
        const baseAmount = subtotal - discount;
        let taxPercentage = 0;
        let serviceChargePercentage = 0;
        
        if (tax > 0 && baseAmount > 0) {
          taxPercentage = Math.round((tax / baseAmount) * 1000) / 10; // 1 decimal place
        }
        if (serviceCharge > 0 && baseAmount > 0) {
          serviceChargePercentage = Math.round((serviceCharge / baseAmount) * 1000) / 10;
        }
        
        // Fix total calculation accuracy (handle -1 issue)
        let total = Number(parsed.total) || (subtotal - discount + tax + serviceCharge);
        
        // Auto-correct common OCR errors in total (off by 1)
        const calculatedTotal = subtotal - discount + tax + serviceCharge;
        if (Math.abs(total - calculatedTotal) === 1) {
          console.log('Fixed Groq: Correcting total from', total, 'to', calculatedTotal);
          total = calculatedTotal;
        }
        
        // Estimate missing item prices if some items are unclear
        const processedItems = this.estimateMissingPrices(validItems, subtotal);
        
        const confidence = Math.min(Math.max(Number(parsed.confidence) || 0.7, 0), 1);

        return {
          items: processedItems,
          subtotal,
          discount,
          tax,
          taxPercentage,
          serviceCharge,
          serviceChargePercentage,
          total,
          confidence,
          rawText: content,
          provider: 'groq-llama4-scout'
        };
      }
      
      throw new Error('Invalid JSON structure');
      
    } catch (error) {
      console.error('Fixed Groq: JSON parse failed, trying regex fallback:', error);
      console.log('Fixed Groq: Raw content causing error:', content.substring(0, 500));
      return this.parseWithRegex(content);
    }
  }

  // Validate JSON structure
  static isValidJSON(jsonText: string): boolean {
    try {
      // Basic structure checks
      if (!jsonText.startsWith('{') || !jsonText.endsWith('}')) {
        return false;
      }
      
      // Check for balanced braces
      let braceCount = 0;
      for (const char of jsonText) {
        if (char === '{') braceCount++;
        if (char === '}') braceCount--;
        if (braceCount < 0) return false;
      }
      
      if (braceCount !== 0) return false;
      
      // Try parsing to catch syntax errors
      JSON.parse(jsonText);
      return true;
    } catch {
      return false;
    }
  }

  // Estimate missing item prices based on subtotal
  static estimateMissingPrices(items: OrderItem[], subtotal: number): OrderItem[] {
    const knownTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const missingAmount = subtotal - knownTotal;
    
    // Find items with suspiciously low prices (likely OCR errors)
    const suspiciousItems = items.filter(item => item.price < 1000);
    
    if (missingAmount > 0 && suspiciousItems.length === 1) {
      console.log('Fixed Groq: Estimating price for unclear item:', suspiciousItems[0].name);
      suspiciousItems[0].price = Math.round(missingAmount / suspiciousItems[0].quantity);
    }
    
    return items;
  }

  static parseWithRegex(content: string): OCRResult {
    console.log('Fixed Groq: Using regex parsing as fallback');
    
    const items: OrderItem[] = [];
    let tax = 0;
    let taxPercentage = 0;
    let serviceCharge = 0;
    let serviceChargePercentage = 0;
    
    // Regex patterns for Indonesian receipts
    const patterns = {
      // Item patterns: "Nasi Goreng 25000" or "2x Es Teh 16000"
      items: /(?:(\d+)x?\s+)?([A-Za-z][\w\s]+?)\s+(?:Rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})*|\d+)/gm,
      // Price patterns: "25.000", "25,000", "25000"
      prices: /(?:Rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{4,})/g,
      // Tax patterns: "Pajak 10%: 5000" or "PPN 10% 5000"
      tax: /(?:pajak|ppn|tax)\s*(?:(\d+)%)?[:\s]*(\d{1,3}(?:[.,]\d{3})*|\d+)/gi,
      // Service charge patterns: "Service Charge 5%: 2500" or "Biaya Layanan 5% 2500"
      serviceCharge: /(?:service\s*charge|biaya\s*layanan|layanan)\s*(?:(\d+)%)?[:\s]*(\d{1,3}(?:[.,]\d{3})*|\d+)/gi,
      // Discount patterns: "Diskon 10%" or "Disc -2500"
      discount: /(?:diskon|disc|potongan)\s*(?:(\d+)%)?[:\s-]*(\d{1,3}(?:[.,]\d{3})*|\d+)/gi
    };
    
    // Extract items
    let match;
    while ((match = patterns.items.exec(content)) !== null) {
      const quantity = parseInt(match[1]) || 1;
      const name = match[2].trim();
      const priceStr = match[3].replace(/[.,]/g, '');
      const price = parseInt(priceStr);
      
      if (name.length > 2 && price > 1000 && price < 1000000) {
        items.push({
          name,
          price: Math.round(price / quantity), // Price per unit
          quantity,
          discount: 0
        });
      }
    }
    
    // Extract tax
    const taxMatch = patterns.tax.exec(content);
    if (taxMatch) {
      taxPercentage = parseInt(taxMatch[1]) || 10;
      tax = parseInt(taxMatch[2].replace(/[.,]/g, '')) || 0;
    }
    
    // Extract service charge
    const serviceChargeMatch = patterns.serviceCharge.exec(content);
    if (serviceChargeMatch) {
      serviceChargePercentage = parseInt(serviceChargeMatch[1]) || 5;
      serviceCharge = parseInt(serviceChargeMatch[2].replace(/[.,]/g, '')) || 0;
    }
    
    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalDiscount = items.reduce((sum, item) => sum + (item.discount || 0), 0);
    const total = subtotal - totalDiscount + tax + serviceCharge;
    
    return {
      items,
      subtotal,
      discount: totalDiscount,
      tax,
      taxPercentage,
      serviceCharge,
      serviceChargePercentage,
      total,
      confidence: items.length > 0 ? 0.6 : 0.2, // Lower confidence for regex
      rawText: content,
      provider: 'regex-fallback'
    };
  }
}