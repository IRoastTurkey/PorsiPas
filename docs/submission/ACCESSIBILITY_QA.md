# Accessibility and inclusive-polish QA

This is a practical V1 test guide, not a claim of formal accessibility certification.

## Interaction

- Every important action is a labelled button with a comfortable touch target (aim for at least 44 × 44 points).
- Map markers expose title, stock, and status to assistive technology; the map must also have a list alternative if Phase 3 provides one.
- Camera, location, and notification denial screens explain what still works and provide a real next action.
- The collection action cannot be triggered twice while a request is pending.
- Focus returns to a logical control after dismissing a modal or scanner.

## Meaning

- Active, low-stock, ending-soon, depleted, expired, and cancelled states use labels/symbols as well as colour.
- “Rescue confirmed” appears only for a `success` result from the collection service.
- Error and offline states explicitly say that no meal was claimed when confirmation is unknown.
- PorsiPal is never the sole carrier of meaning; nearby text states the result.
- Text avoids blame, shame, or exaggerated environmental impact.

## Motion and vision

- Enable the device's **Reduce Motion** setting and confirm essential content appears immediately without springing or fading.
- Check key screens in bright light and dark surroundings. The V1 may use a light theme, but text must remain legible.
- Increase device text size and confirm buttons and status labels do not clip at common larger settings.
- Check colour-blind-safe comprehension by temporarily viewing screenshots in greyscale.

## Screen-reader smoke test

On one physical device, enable TalkBack or VoiceOver and complete:

1. Open discovery and identify an active FoodDrop.
2. Read its title, status, remaining portions, distance, and pickup deadline.
3. Open the FoodDrop detail.
4. Reach the scan/collect action.
5. After a confirmed test collection, hear the success heading and updated stock.
6. Navigate back without becoming trapped in the success view.
7. Open the PorsiPal Cosmic Journey and hear the rank, next-rank progress, weekly mission, daily status, and each badge's locked/unlocked state.
8. Open and dismiss the native share sheet, then confirm focus returns to the originating screen.
9. Open the 30-second tour from Discover and navigate through all three labelled steps.

Record device, OS version, tester, date, and any limitations in the final checklist.
