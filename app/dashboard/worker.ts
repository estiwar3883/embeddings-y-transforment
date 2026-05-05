/// <reference lib="webworker" />

import { pipeline, type FeatureExtractionPipeline } from "@huggingface/transformers";

interface WorkerRequest {
  text: string;
}

export interface WorkerResponse {
  status: "complete" | "error" | "progress";
  output?: number[];
  message?: string;
}

const ctx: DedicatedWorkerGlobalScope = self as unknown as DedicatedWorkerGlobalScope;

class EmbeddingPipeline {
  static task = "feature-extraction" as const;
  static model = "Xenova/all-MiniLM-L6-v2";
  static instance: FeatureExtractionPipeline | null = null;

  static async getInstance(): Promise<FeatureExtractionPipeline> {
    if (this.instance === null) {
      const pipe = await pipeline(this.task, this.model);
      this.instance = pipe;
    }
    return this.instance;
  }
}

ctx.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  try {
    const extractor = await EmbeddingPipeline.getInstance();
    const output = await extractor(e.data.text, {
      pooling: "mean",
      normalize: true,
    });
    ctx.postMessage({
      status: "complete",
      output: Array.from(output.data as Float32Array),
    } as WorkerResponse);
  } catch (error) {
    ctx.postMessage({
      status: "error",
      message: error instanceof Error ? error.message : "Error en el worker",
    } as WorkerResponse);
  }
};

export {};