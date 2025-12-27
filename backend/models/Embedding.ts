import mongoose, { Schema, Document } from 'mongoose';

export interface IEmbedding extends Document {
  materialId: mongoose.Types.ObjectId;
  chunkText: string;
  vector: number[]; // Array of numbers for the embedding vector
  createdAt: Date;
}

const EmbeddingSchema: Schema = new Schema(
  {
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'Material',
      required: true,
    },
    chunkText: {
      type: String,
      required: true,
    },
    vector: {
      type: [Number], // Array of numbers
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a MongoDB Atlas Vector Search index on the 'vector' field
// This would typically be done manually in Atlas UI or via an SDK for production.
// For demonstration, we assume an index named 'vector_index' exists on the 'vector' field.

const Embedding = mongoose.model<IEmbedding>('Embedding', EmbeddingSchema);
export default Embedding;