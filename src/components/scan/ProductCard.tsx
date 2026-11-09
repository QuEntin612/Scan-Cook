"use client";

import { useState } from "react";
import type { Product } from "@/lib/product";
import { fr } from "@/lib/profile";

// Carte d'un produit : image, nom, marque, quantité et quelques valeurs pour 100 g.
export default function ProductCard({ product }: { product: Product }) {
  const [imgFailed, setImgFailed] = useState(false);
  const n = product.nutriments;
  const facts = [
    n.kcal !== undefined && `${fr(n.kcal)} kcal`,
    n.proteins !== undefined && `${fr(n.proteins, n.proteins % 1 ? 1 : 0)} g prot.`,
    n.carbs !== undefined && `${fr(n.carbs, n.carbs % 1 ? 1 : 0)} g gluc.`,
    n.fat !== undefined && `${fr(n.fat, n.fat % 1 ? 1 : 0)} g lip.`,
  ].filter(Boolean) as string[];

  return (
    <div className="product-card">
      <div className="product-thumb">
        {product.image && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={`Photo de ${product.name}`} onError={() => setImgFailed(true)} />
        ) : (
          <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 10h18l-1.8 9.2a1 1 0 0 1-1 .8H5.8a1 1 0 0 1-1-.8zM8 10l4-6 4 6M9 14v3M15 14v3" />
          </svg>
        )}
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        {(product.brand || product.quantity) && (
          <p className="product-brand">{[product.brand, product.quantity].filter(Boolean).join(" · ")}</p>
        )}
        {facts.length > 0 && <p className="product-facts">Pour 100 g : {facts.join(" · ")}</p>}
        {product.source === "manuel" && <p className="product-facts">Utiliser ce nom tel quel</p>}
      </div>
    </div>
  );
}
