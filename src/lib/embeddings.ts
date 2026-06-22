import { pipeline } from '@xenova/transformers';

// This is a singleton pattern to ensure the model is only loaded once in the Node process
class PipelineSingleton {
    static task = 'feature-extraction';
    static model = 'Xenova/all-MiniLM-L6-v2';
    static instance: any = null;

    static async getInstance(progress_callback?: any) {
        if (this.instance === null) {
            this.instance = await pipeline(this.task, this.model, { progress_callback });
        }
        return this.instance;
    }
}

export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const extractor = await PipelineSingleton.getInstance();
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        // output.data is a Float32Array of size 384
        return Array.from(output.data);
    } catch (error) {
        console.error("Error generating local embedding:", error);
        throw error;
    }
}
