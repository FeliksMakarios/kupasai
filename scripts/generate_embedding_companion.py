"""Train an auditable distributional snapshot from an original MIT-licensed toy corpus."""
from pathlib import Path
import json
import numpy as np
root=Path(__file__).resolve().parents[1]
corpus=[f'{person} {action}' for person in ['raja','ratu','guru','dosen','ayah','ibu'] for action in ['membaca buku','menulis cerita','belajar bersama']]
corpus += [f'{person} {action}' for person in ['guru','dosen'] for action in ['mengajar siswa','menilai tugas']]
corpus += [f'{person} {action}' for person in ['raja','ratu'] for action in ['mengunjungi istana','memimpin rapat']]
corpus += [f'{person} {action}' for person in ['ayah','ibu'] for action in ['merawat anak','memasak bersama']]
words=sorted({w for line in corpus for w in line.split()});idx={w:i for i,w in enumerate(words)}
counts=np.zeros((len(words),len(words)))
for line in corpus:
 tokens=line.split()
 for i,w in enumerate(tokens):
  for j in range(max(0,i-2),min(len(tokens),i+3)):
   if i!=j:counts[idx[w],idx[tokens[j]]]+=1
expected=counts.sum(1)[:,None]*counts.sum(0)[None,:]
ratio=np.divide(counts*counts.sum(),expected,out=np.ones_like(counts),where=expected>0)
ppmi=np.maximum(0,np.log(np.maximum(ratio,1e-12)))
u,s,vt=np.linalg.svd(ppmi,full_matrices=False)
# Canonicalize signs for reproducibility across equivalent singular-vector orientations.
for j in range(u.shape[1]):
 if u[np.argmax(np.abs(u[:,j])),j]<0:u[:,j]*=-1
vectors=u[:,:8]*np.sqrt(s[:8])
centered=vectors-vectors.mean(0);_,_,basis=np.linalg.svd(centered,full_matrices=False);xy=centered@basis[:2].T
payload={'method':'Window-2 cooccurrence → PPMI → SVD (8 dimensions); PCA to 2D','license':'MIT; original synthetic corpus in this generator','corpus':corpus,'words':[{ 'word':w,'vector':vectors[i].round(10).tolist(),'xy':xy[i].round(10).tolist()}for i,w in enumerate(words)]}
(root/'nlp/word-embeddings/companion.js').write_text('window.EmbeddingCompanion='+json.dumps(payload,ensure_ascii=False)+';\n')
print('Saved',len(words),'learned toy vectors from',len(corpus),'sentences')
