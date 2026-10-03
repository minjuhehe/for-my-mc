package net.lostsky.worth;

/** No server startup needed. Covers menu icons vs all player inventory boundaries. */
public final class SlotFilterCheck {
    public static void main(String[] args) {
        int checks = 0;
        for (int top : new int[]{9, 18, 27, 36, 45, 54}) {
            for (int slot = -1; slot <= top + 40; slot++) {
                boolean expected = slot >= top && slot < top + 36;
                if (LostSkyWorth.isPlayerSlot(1, slot, top) != expected)
                    throw new AssertionError("menu size=" + top + " slot=" + slot);
                checks++;
            }
        }
        for (int slot = -1; slot <= 50; slot++) {
            if (LostSkyWorth.isPlayerSlot(0, slot, 5) != (slot >= 5 && slot <= 45))
                throw new AssertionError("own inventory slot=" + slot);
            if (LostSkyWorth.isPlayerSlot(-2, slot, 5) != (slot >= 0 && slot <= 40))
                throw new AssertionError("direct inventory slot=" + slot);
            if (LostSkyWorth.isPlayerSlot(-1, slot, 54))
                throw new AssertionError("carried item should have no injected price");
            checks += 3;
        }
        System.out.println("PASS " + checks + " inventory/menu packet slot checks");
    }
}
