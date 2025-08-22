import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LearningData {
  imageUri: string;
  actualResult: any;
  userCorrections?: any;
  confidence: number;
  timestamp: number;
  success: boolean;
}

export class OCRLearningSystem {
  private static readonly STORAGE_KEY = 'ocr_learning_data';
  private static readonly MAX_LEARNING_ENTRIES = 100;

  // Store learning data for continuous improvement
  static async storeLearningData(data: LearningData): Promise<void> {
    try {
      const existingData = await this.getLearningData();
      const newData = [data, ...existingData].slice(0, this.MAX_LEARNING_ENTRIES);
      
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(newData));
      console.log('OCR Learning: Stored learning data entry');
    } catch (error) {
      console.error('OCR Learning: Failed to store data:', error);
    }
  }

  // Get historical learning data
  static async getLearningData(): Promise<LearningData[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('OCR Learning: Failed to get learning data:', error);
      return [];
    }
  }

  // Analyze success patterns
  static async getSuccessMetrics(): Promise<{
    totalAttempts: number;
    successRate: number;
    averageConfidence: number;
    commonFailures: string[];
  }> {
    try {
      const data = await this.getLearningData();
      
      if (data.length === 0) {
        return {
          totalAttempts: 0,
          successRate: 0,
          averageConfidence: 0,
          commonFailures: []
        };
      }

      const totalAttempts = data.length;
      const successfulAttempts = data.filter(d => d.success).length;
      const successRate = (successfulAttempts / totalAttempts) * 100;
      const averageConfidence = data.reduce((sum, d) => sum + d.confidence, 0) / totalAttempts;

      // Identify common failure patterns
      const failures = data.filter(d => !d.success || d.confidence < 0.7);
      const commonFailures = this.analyzeFailurePatterns(failures);

      return {
        totalAttempts,
        successRate,
        averageConfidence,
        commonFailures
      };
    } catch (error) {
      console.error('OCR Learning: Failed to get metrics:', error);
      return {
        totalAttempts: 0,
        successRate: 0,
        averageConfidence: 0,
        commonFailures: []
      };
    }
  }

  private static analyzeFailurePatterns(failures: LearningData[]): string[] {
    // Analyze common failure reasons
    const patterns: string[] = [];
    
    const lowConfidenceCount = failures.filter(f => f.confidence < 0.5).length;
    const mediumConfidenceCount = failures.filter(f => f.confidence >= 0.5 && f.confidence < 0.7).length;
    
    if (lowConfidenceCount > failures.length * 0.3) {
      patterns.push('Low image quality or blur');
    }
    
    if (mediumConfidenceCount > failures.length * 0.4) {
      patterns.push('Complex receipt layouts');
    }
    
    return patterns;
  }

  // Generate improved prompt based on learning
  static async generateImprovedPrompt(): Promise<string> {
    const metrics = await this.getSuccessMetrics();
    
    let basePrompt = `Kamu adalah AI OCR expert dengan tingkat akurasi ${Math.round(metrics.averageConfidence * 100)}% berdasarkan ${metrics.totalAttempts} analisis sebelumnya.`;
    
    if (metrics.commonFailures.length > 0) {
      basePrompt += `\n\nPERHATIAN KHUSUS (berdasarkan pembelajaran):\n`;
      metrics.commonFailures.forEach(failure => {
        basePrompt += `- ${failure}\n`;
      });
    }
    
    basePrompt += `\n\nTARGET: Tingkatkan akurasi dari ${Math.round(metrics.successRate)}% menjadi 100%`;
    
    return basePrompt;
  }

  // Clear learning data (for testing)
  static async clearLearningData(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('OCR Learning: Cleared all learning data');
    } catch (error) {
      console.error('OCR Learning: Failed to clear data:', error);
    }
  }
}