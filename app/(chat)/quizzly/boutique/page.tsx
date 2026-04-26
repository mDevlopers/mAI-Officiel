"use client";

import { useEffect, useState } from "react";
import {
  getQuizzlyProfile,
  getQuizzlyInventory,
  buyItem,
} from "@/lib/quizzly/actions";
import { toast } from "sonner";
import { Star, Zap, Shield, Diamond } from "lucide-react";

const SHOP_ITEMS = [
  {
    key: "star_1",
    name: "1 Étoile",
    icon: Star,
    color: "text-yellow-400 bg-yellow-50",
    price: 50,
    type: "star",
  },
  {
    key: "star_5",
    name: "Pack 5 Étoiles",
    icon: Star,
    color: "text-orange-500 bg-orange-50",
    price: 200,
    type: "star",
    amount: 5,
  },
  {
    key: "booster_x1.5",
    name: "Booster x1.5",
    icon: Zap,
    color: "text-cyan-500 bg-cyan-50",
    price: 100,
    type: "booster",
  },
  {
    key: "booster_x2",
    name: "Booster x2",
    icon: Zap,
    color: "text-blue-500 bg-blue-50",
    price: 200,
    type: "booster",
  },
  {
    key: "booster_x3",
    name: "Booster x3",
    icon: Zap,
    color: "text-rose-500 bg-rose-50",
    price: 400,
    type: "booster",
  },
];

export default function QuizzlyShopPage() {
  const [profile, setProfile] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const [p, inv] = await Promise.all([
      getQuizzlyProfile(),
      getQuizzlyInventory(),
    ]);
    setProfile(p);
    setInventory(inv);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBuy = async (itemKey: string, price: number, amount = 1) => {
    if (profile.diamonds < price) {
      toast.error("Pas assez de diamants !");
      return;
    }

    try {
      await buyItem(itemKey, price, amount);
      toast.success("Achat réussi !");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading)
    return <div className="p-10 text-center animate-pulse">Chargement...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Boutique</h1>
          <p className="text-slate-500 mt-1">
            Dépense tes diamants pour des boosters et de l'énergie.
          </p>
        </div>
        <div className="bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
          {profile.diamonds} <Diamond className="w-5 h-5 text-cyan-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SHOP_ITEMS.map((item) => {
          const owned =
            inventory.find((i) => i.itemKey === item.key)?.quantity || 0;

          return (
            <div
              key={item.key}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center"
            >
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${item.color}`}
              >
                <item.icon className="w-10 h-10" />
              </div>
              <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-wider">
                {item.type}
              </p>

              <div className="mt-auto w-full space-y-3">
                {item.type === "booster" && owned > 0 && (
                  <div className="text-xs font-bold text-violet-600 bg-violet-50 py-1.5 rounded-lg">
                    En stock : {owned}
                  </div>
                )}
                <button
                  onClick={() => handleBuy(item.key, item.price, item.amount)}
                  disabled={profile.diamonds < item.price}
                  className="w-full bg-slate-100 text-slate-800 font-bold py-3 rounded-xl hover:bg-slate-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {item.price} <Diamond className="w-4 h-4 text-cyan-500" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
