/**
 * Scrolls a PrimeVue Drawer content area to the top for a scoped drawer root.
 */
export function scrollDrawerContentToTop(drawerRootClass: string): void {
  const drawerContent = document.querySelector(
    `.${drawerRootClass} .p-drawer-content`,
  );

  if (!(drawerContent instanceof HTMLElement)) {
    return;
  }

  drawerContent.scrollTo({ top: 0, behavior: "auto" });
}
