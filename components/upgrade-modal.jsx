"use client";

import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function UpgradeModal({ isOpen, onClose, trigger = "limit" }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
          </div>
          <DialogDescription>
            {trigger === "header" && "Create Unlimited Events with Pro! "}
            {trigger === "limit" && "You've reached your free event limit. "}
            {trigger === "color" && "Custom theme colors are a Pro feature. "}
            Unlock unlimited events and premium features!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="bg-muted border p-6 rounded-xl flex flex-col gap-3">
            <h3 className="font-semibold text-xl">Pro Plan</h3>
            <p className="text-muted-foreground text-sm">
              Unlock all premium features including unlimited events and custom theme colors.
            </p>
            <div className="text-3xl font-bold my-2">
              $9.99<span className="text-sm font-normal text-muted-foreground">/mo</span>
            </div>
            <Button
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              onClick={() => {
                // Mock upgrade logic here or redirect to Stripe checkout
                window.alert("Billing integration pending. This is a mock upgrade button.");
              }}
            >
              Upgrade Now
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
