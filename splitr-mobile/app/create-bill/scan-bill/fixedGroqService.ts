import * as FileSystem from 'expo-file-system';

export interface OrderItem {
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  itemDiscount: number;
  inferred: boolean;
}

export interface OCRResult {
  items: OrderItem[];
  itemsSubtotal: number;
  orderFee: number;
  serviceCharge: number;
  serviceChargePercentage: number;
  tax: number;
  taxPercentage: number;
  totalDiscount: number;
  grandTotal: number;
  printedSubtotal?: number;
  printedGrandTotal?: number;
  confidence: number;
  rawText: string;
  provider: string;
  notes: string[];
}

export class FixedGroqService {
  static readonly API_KEY = 'EXPO_PUBLIC_GROQ_API_KEY';
  static readonly API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  static lastRequestTime = 0;
  static readonly MIN_REQUEST_INTERVAL = 2000;

  static async processReceipt(imageUri: string): Promise<OCRResult> {
    console.log('Fixed Groq: Starting receipt OCR processing: ' + imageUri);
    
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

      console.log('Fixed Groq: Image converted, size: ' + Math.round(base64Image.length / 1024) + ' KB');

      // Call Groq API
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
                  text: this.createReceiptPrompt()
                },
                {
                  type: "image_url",
                  image_url: {
                    url: 'data:image/jpeg;base64,' + base64Image
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
        console.error('Fixed Groq: API Error: ' + response.status + ' ' + errorText);
        throw new Error('Groq API error: ' + response.status + ' - ' + errorText);
      }

      const apiResult = await response.json();
      console.log('Fixed Groq: API Response received');

      const content = apiResult.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from Groq');
      }

      console.log('Fixed Groq: Raw response: ' + content);
      const result = this.parseResponse(content);
      
      console.log('Fixed Groq: Processing completed in ' + (Date.now() - startTime) + 'ms');
      return result;

    } catch (error) {
      console.error('Fixed Groq: Processing failed: ' + String(error));
      throw error;
    }
  }

  static createReceiptPrompt(): string {
    return `Analisis struk Indonesia dengan PRIORITAS LINE TOTAL dan deteksi diskon komprehensif:

PRIORITAS PARSING:
1. ITEM DENGAN QTY > 1: Utamakan line total (harga akhir baris)
   - "2x Ayam Goreng 15.000 30.000" → lineTotal=30000, unitPrice=15000
   - "3 Es Teh @ 8.000 = 24.000" → lineTotal=24000, unitPrice=8000
   - Jika hanya ada qty & satu angka → anggap lineTotal, hitung unitPrice

2. DISKON PER ITEM (warna merah di UI):
   - Deteksi: diskon|disc|promo|hemat tepat di bawah/sama baris item
   - "Ayam Bakar 30.000\\nDiskon 3.000" → itemDiscount=3000, lineTotal=27000
   - "Nasi (Promo 5rb) 20.000" → itemDiscount=5000, lineTotal=20000

3. ORDER FEE & BIAYA TAMBAHAN:
   - "Order Fee", "Biaya Antar", "Biaya Layanan" → orderFee
   - Berbeda dari service charge restoran

4. DISKON TOTAL (akhir struk, warna merah):
   - "Diskon Total", "Hemat", "Voucher", "Promo" dekat subtotal
   - Terapkan setelah semua perhitungan

5. PRINTED VALUES (untuk validasi):
   - Catat "Subtotal" dan "Grand Total" yang tercetak
   - Gunakan untuk koreksi off-by-one

JSON OUTPUT:
{
  "items": [
    {
      "name": "nama_item",
      "unitPrice": harga_per_unit_integer,
      "quantity": jumlah,
      "lineTotal": total_baris_setelah_diskon_item,
      "itemDiscount": diskon_per_item_atau_0,
      "inferred": false_atau_true_jika_harga_ditebak
    }
  ],
  "itemsSubtotal": sum_semua_lineTotal,
  "orderFee": biaya_order_atau_0,
  "serviceCharge": service_charge_rupiah_atau_0,
  "serviceChargePercentage": persentase_sc_atau_0,
  "tax": pajak_rupiah_atau_0,
  "taxPercentage": persentase_pajak_atau_0,
  "totalDiscount": diskon_total_akhir_atau_0,
  "grandTotal": total_akhir_setelah_semua,
  "printedSubtotal": subtotal_tercetak_atau_null,
  "printedGrandTotal": grand_total_tercetak_atau_null,
  "confidence": tingkat_keyakinan_0_sampai_1
}

RULES NORMALISASI:
- Semua angka INTEGER rupiah (hapus Rp, titik, koma)
- Qty tidak terbaca = 1
- Prioritas: line total > unit price calculation
- Tandai inferred=true jika harga tidak jelas

RETURN HANYA JSON!`;
  }

  static parseResponse(content: string): OCRResult {
    try {
      // Enhanced JSON extraction
      let jsonText = content.trim();
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      
      const jsonStart = jsonText.indexOf('{');
      const jsonEnd = jsonText.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd + 1);
      }

      console.log('Fixed Groq: Parsing JSON: ' + jsonText);
      const parsed = JSON.parse(jsonText);
      
      if (parsed.hasOwnProperty('items') && Array.isArray(parsed.items)) {
        return this.processAdvancedOCR(parsed, content);
      }
      
      throw new Error('Invalid JSON structure');
      
    } catch (error) {
      console.error('Fixed Groq: JSON parse failed, trying regex fallback: ' + String(error));
      return this.parseWithRegex(content);
    }
  }

  static processAdvancedOCR(parsed: any, rawText: string): OCRResult {
    const notes: string[] = [];
    
    // 1. Process items with line total priority
    const validItems: OrderItem[] = [];
    parsed.items.forEach((item: any) => {
      if (item.name) {
        const qty = Math.max(1, Number(item.quantity) || 1);
        const lineTotal = Math.round(Number(item.lineTotal) || 0);
        const itemDiscount = Math.round(Number(item.itemDiscount) || 0);
        const inferred = Boolean(item.inferred);
        
        // Calculate unit price from line total (priority rule)
        let unitPrice = Math.round(Number(item.unitPrice) || 0);
        if (lineTotal > 0 && qty > 1) {
          unitPrice = Math.round(lineTotal / qty);
          if (item.unitPrice && Math.abs(unitPrice - item.unitPrice) > 100) {
            notes.push('Item ' + item.name + ': Used lineTotal/qty for unitPrice');
          }
        }
        
        if (lineTotal > 0 || unitPrice > 0) {
          validItems.push({
            name: String(item.name).trim(),
            unitPrice,
            quantity: qty,
            lineTotal: lineTotal || (unitPrice * qty),
            itemDiscount,
            inferred
          });
        }
      }
    });

    // 2. Calculate items subtotal
    const itemsSubtotal = validItems.reduce((sum, item) => sum + item.lineTotal, 0);
    
    // 3. Extract other components
    const orderFee = Math.round(Number(parsed.orderFee) || 0);
    const serviceCharge = Math.round(Number(parsed.serviceCharge) || 0);
    const serviceChargePercentage = Number(parsed.serviceChargePercentage) || 0;
    const tax = Math.round(Number(parsed.tax) || 0);
    const taxPercentage = Number(parsed.taxPercentage) || 0;
    const totalDiscount = Math.round(Number(parsed.totalDiscount) || 0);
    
    const printedSubtotal = parsed.printedSubtotal ? Math.round(Number(parsed.printedSubtotal)) : undefined;
    const printedGrandTotal = parsed.printedGrandTotal ? Math.round(Number(parsed.printedGrandTotal)) : undefined;
    
    // 4. Infer missing item prices if needed
    if (printedSubtotal && printedSubtotal > 0) {
      const inferredItems = validItems.filter(item => item.inferred);
      const knownTotal = validItems.filter(item => !item.inferred)
        .reduce((sum, item) => sum + item.lineTotal, 0);
      
      if (inferredItems.length === 1 && knownTotal < printedSubtotal) {
        const missingAmount = printedSubtotal - knownTotal;
        if (missingAmount > 0) {
          inferredItems[0].lineTotal = missingAmount;
          inferredItems[0].unitPrice = Math.round(missingAmount / inferredItems[0].quantity);
          notes.push('Inferred price for ' + inferredItems[0].name);
        }
      }
    }
    
    // 5. Calculate grand total with order of operations
    let calculatedTotal = itemsSubtotal + orderFee + serviceCharge + tax - totalDiscount;
    
    // 6. Off-by-one correction
    let finalGrandTotal = calculatedTotal;
    if (printedGrandTotal && Math.abs(printedGrandTotal - calculatedTotal) <= 2) {
      const diff = printedGrandTotal - calculatedTotal;
      finalGrandTotal = printedGrandTotal;
      notes.push('Off-by-one correction: ' + (diff > 0 ? '+' : '') + diff + ' rupiah');
    }
    
    // 7. Calculate confidence
    let confidence = Math.min(Math.max(Number(parsed.confidence) || 0.8, 0), 1);
    
    if (validItems.length > 0 && itemsSubtotal > 0) {
      if (printedGrandTotal && Math.abs(finalGrandTotal - printedGrandTotal) <= 2) {
        confidence = Math.min(confidence + 0.1, 1);
      }
    } else {
      confidence = 0.1;
    }

    return {
      items: validItems,
      itemsSubtotal,
      orderFee,
      serviceCharge,
      serviceChargePercentage,
      tax,
      taxPercentage,
      totalDiscount,
      grandTotal: finalGrandTotal,
      printedSubtotal,
      printedGrandTotal,
      confidence,
      rawText,
      provider: 'groq-enhanced',
      notes
    };
  }

  static parseWithRegex(content: string): OCRResult {
    console.log('Fixed Groq: Using regex parsing as fallback');
    
    const items: OrderItem[] = [];
    const notes: string[] = ['Using regex fallback parsing'];
    
    // Basic regex patterns for Indonesian receipts
    const patterns = {
      items: /(?:(\d+)x?\s+)?([A-Za-z][\w\s]+?)\s+(?:Rp\.?\s*)?(\d{1,3}(?:[.,]\d{3})*|\d+)/gm,
      tax: /(?:pajak|ppn|tax)\s*(?:(\d+)%)?\s*[:\s]*(\d{1,3}(?:[.,]\d{3})*|\d+)/gi,
      serviceCharge: /(?:service\s*charge|biaya\s*layanan|layanan)\s*(?:(\d+)%)?\s*[:\s]*(\d{1,3}(?:[.,]\d{3})*|\d+)/gi,
      orderFee: /(?:order\s*fee|biaya\s*antar)\s*[:\s]*(\d{1,3}(?:[.,]\d{3})*|\d+)/gi
    };
    
    // Extract items with line total priority
    let match;
    while ((match = patterns.items.exec(content)) !== null) {
      const quantity = parseInt(match[1]) || 1;
      const name = match[2].trim();
      const lineTotal = parseInt(match[3].replace(/[.,]/g, ''));
      
      if (name.length > 2 && lineTotal > 1000 && lineTotal < 1000000) {
        items.push({
          name,
          unitPrice: Math.round(lineTotal / quantity),
          quantity,
          lineTotal,
          itemDiscount: 0,
          inferred: false
        });
      }
    }
    
    // Extract components
    let tax = 0, taxPercentage = 0;
    const taxMatch = patterns.tax.exec(content);
    if (taxMatch) {
      taxPercentage = parseInt(taxMatch[1]) || 10;
      tax = parseInt(taxMatch[2].replace(/[.,]/g, '')) || 0;
    }
    
    let serviceCharge = 0, serviceChargePercentage = 0;
    const serviceChargeMatch = patterns.serviceCharge.exec(content);
    if (serviceChargeMatch) {
      serviceChargePercentage = parseInt(serviceChargeMatch[1]) || 5;
      serviceCharge = parseInt(serviceChargeMatch[2].replace(/[.,]/g, '')) || 0;
    }
    
    let orderFee = 0;
    const orderFeeMatch = patterns.orderFee.exec(content);
    if (orderFeeMatch) {
      orderFee = parseInt(orderFeeMatch[1].replace(/[.,]/g, '')) || 0;
    }
    
    // Calculate totals
    const itemsSubtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const grandTotal = itemsSubtotal + orderFee + serviceCharge + tax;
    
    return {
      items,
      itemsSubtotal,
      orderFee,
      serviceCharge,
      serviceChargePercentage,
      tax,
      taxPercentage,
      totalDiscount: 0,
      grandTotal,
      confidence: items.length > 0 ? 0.6 : 0.2,
      rawText: content,
      provider: 'regex-fallback',
      notes
    };
  }
}