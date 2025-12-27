import mongoose from 'mongoose';
import Embedding, { IEmbedding } from '../models/Embedding';
import { CustomError } from '../utils/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_ATLAS_DATABASE_NAME = process.env.MONGODB_ATLAS_DATABASE_NAME || 'yds-eduai';
const MONGODB_ATLAS_COLLECTION_NAME = process.env.MONGODB_ATLAS_COLLECTION_NAME || 'embeddings';
const MONGODB_ATLAS_VECTOR_INDEX_NAME = 'vector_index'; // Assuming this index is created in Atlas

export const storeEmbeddings = async (
  materialId: mongoose.Types.ObjectId,
  chunks: string[],
  vectors: number[][]
): Promise<void> => {
  try {
    if (chunks.length !== vectors.length) {
      throw new CustomError('Number of chunks and vectors must match.', 400);
    }

    const embeddingDocs = chunks.map((chunk, index) => ({
      materialId,
      chunkText: chunk,
      vector: vectors[index],
    }));

    await Embedding.insertMany(embeddingDocs);
    console.log(`Stored ${embeddingDocs.length} embeddings for material ${materialId}`);
  } catch (error: any) {
    console.error('Error storing embeddings:', error);
    throw new CustomError(`Failed to store embeddings: ${error.message}`, 500);
  }
};

export const searchEmbeddings = async (
  queryVector: number[],
  k: number = 5,
  materialId?: mongoose.Types.ObjectId
): Promise<IEmbedding[]> => {
  try {
    const pipeline: any[] = [
      {
        $vectorSearch: {
          index: MONGODB_ATLAS_VECTOR_INDEX_NAME,
          path: 'vector',
          queryVector: queryVector,
          numCandidates: k * 10, // Search more candidates for better recall
          limit: k,
        },
      },
      {
        $project: {
          chunkText: 1,
          materialId: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    if (materialId) {
      // Add a match stage to filter by materialId if provided
      pipeline.unshift({
        $match: { materialId: new mongoose.Types.ObjectId(materialId) }
      });
    }

    const results = await Embedding.aggregate(pipeline).exec();
    return results as IEmbedding[];
  } catch (error: any) {
    console.error('Error searching embeddings:', error);
    throw new CustomError(`Failed to search embeddings: ${error.message}`, 500);
  }
};