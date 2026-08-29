-- Preserve the stable `unauthenticated` collection result for clients with no session.
-- The function itself performs no mutation unless auth.uid() is present.

revoke all on function public.collect_food_drop(text) from public;
grant execute on function public.collect_food_drop(text) to anon, authenticated;
