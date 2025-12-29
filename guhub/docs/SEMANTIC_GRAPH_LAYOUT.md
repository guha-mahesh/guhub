# Semantic 3D Graph Layout - "Guha's Vibes Manifold"

## Concept

Replace the arbitrary force-directed layout with **ML-generated semantic positioning** where node locations represent actual conceptual similarity.

## The Goal

Transform the brain graph into a navigable knowledge space where:
- Nodes that "vibe together" cluster close in 3D space
- Position = semantic meaning, not random physics
- The graph becomes a visual representation of conceptual relationships

## Technical Approach

### Step 1: Generate Embeddings
- Input: Node names + descriptions (e.g., "Cocteau Twins - Dream pop pioneers")
- Use text embedding models:
  - **OpenAI Embeddings API** (easy, paid)
  - **sentence-transformers** (local, free, e.g., `all-MiniLM-L6-v2`)
  - **BERT/similar transformers** (more control)
- Output: Each node → high-dimensional vector (384d, 768d, 1536d depending on model)

### Step 2: Dimensionality Reduction
Reduce high-dimensional embeddings to 3D coordinates while preserving semantic relationships:

**Option A: PCA (Principal Component Analysis)**
- Fast, deterministic
- Linear projection
- Preserves global structure
- Good for initial exploration

**Option B: UMAP (Uniform Manifold Approximation)**
- Better at preserving local neighborhoods
- Non-linear
- More "clustery" results
- Better for "vibe zones"

**Option C: t-SNE**
- Great for visualization
- Can be slower
- More dramatic clustering

### Step 3: Apply to Graph
1. Generate coordinates for all 50 nodes
2. Update `graphNodes.ts` with fixed `x`, `y`, `z` positions
3. Disable force simulation entirely
4. Nodes appear in their semantic locations

## Implementation Steps

### Python Script (`generate_node_positions.py`)
```python
from sentence_transformers import SentenceTransformer
from sklearn.decomposition import PCA
# or: from umap import UMAP
import json

# Load model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Create embeddings from node descriptions
nodes = [
    {"id": "m1", "name": "Cocteau Twins", "description": "Dream pop pioneers"},
    # ... all nodes
]

texts = [f"{n['name']} {n['description']}" for n in nodes]
embeddings = model.encode(texts)

# Reduce to 3D
pca = PCA(n_components=3)
# or: reducer = UMAP(n_components=3)
coords_3d = pca.fit_transform(embeddings)

# Scale to reasonable graph range (e.g., -500 to 500)
coords_scaled = coords_3d * 300

# Export
for node, coords in zip(nodes, coords_scaled):
    node['x'] = float(coords[0])
    node['y'] = float(coords[1])
    node['z'] = float(coords[2])

with open('node_positions.json', 'w') as f:
    json.dump(nodes, f, indent=2)
```

### Alternative: Custom Vibe Dimensions
Instead of pure ML, manually define semantic axes:
- **Axis 1**: Abstract ↔ Concrete
- **Axis 2**: Emotional ↔ Analytical
- **Axis 3**: Individual ↔ Collective

Rate each node on these dimensions → direct 3D coordinates

## Result

- **Cocteau Twins** near other ethereal/dream music
- **Peter Singer** clusters with ethical philosophy concepts
- **Iceland** near other geography/nature nodes
- Cross-galaxy connections become visually meaningful
- Graph = **navigable conceptual space**

## Files to Modify

1. `src/data/graphNodes.ts` - Add x, y, z coordinates
2. `src/components/BrainGraph.tsx` - Add `nodeRelSize` or similar to fix positions
3. Potentially disable or simplify force simulation

## Benefits

✓ Positions have **semantic meaning**
✓ Similar concepts cluster together naturally
✓ The layout is **reproducible** (not random each load)
✓ Enables conceptual navigation of the knowledge graph
✓ Very "Guha's brain" - personalized vibe space

## Next Steps

1. Gather all node descriptions (flesh out placeholder data)
2. Choose embedding model
3. Run dimensionality reduction
4. Update graph with fixed coordinates
5. Optional: Add legend explaining the semantic axes
