import { GoogleGenAI } from "@google/genai";
import { Attachment } from "../types";

const SYSTEM_INSTRUCTION = `
Bạn là một gia sư toán học AI thông minh, kiên nhẫn và hữu ích.
Nhiệm vụ của bạn là giúp người dùng giải quyết các bài toán từ cơ bản đến nâng cao.

Quy tắc quan trọng:
1. Luôn giải thích từng bước (step-by-step) để người dùng hiểu bản chất vấn đề.
2. Trả lời bằng Tiếng Việt.
3. Khi viết công thức toán học, BẮT BUỘC phải sử dụng định dạng LaTeX.
4. Bọc công thức inline (cùng dòng) trong dấu $ (ví dụ: $x^2 + 2x + 1 = 0$).
5. Bọc công thức block (dòng riêng) trong dấu $$ (ví dụ: $$ \int_{0}^{\infty} e^{-x} dx $$).
6. Nếu người dùng gửi ảnh, hãy phân tích ảnh (OCR), trích xuất đề bài và giải chi tiết.
`;

let client: GoogleGenAI | null = null;

const getClient = () => {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const sendMessageToGemini = async (
  text: string,
  attachment?: Attachment
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Prepare contents
    const parts: any[] = [];
    
    if (attachment) {
      parts.push({
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.data,
        },
      });
    }

    if (text) {
      parts.push({ text: text });
    }

    // Default message if only image is sent
    if (parts.length === 0) {
      return "Vui lòng nhập nội dung hoặc gửi ảnh.";
    }
    
    // Using gemini-2.5-flash for speed and vision capabilities
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        role: "user",
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more precise math responses
      }
    });

    return response.text || "Xin lỗi, tôi không thể tạo câu trả lời lúc này.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
