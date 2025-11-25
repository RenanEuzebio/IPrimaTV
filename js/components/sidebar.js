/**
 * Sidebar Component
 * Handles sidebar toggle functionality
 */

/**
 * Setup the sidebar toggle button
 */
export function setupSidebarToggle() {
    const btn = document.getElementById("toggleSidebar");

    if (!btn) {
        console.warn("Toggle sidebar button not found");
        return;
    }

    btn.addEventListener("click", () => {
        const collapsed = document.body.classList.toggle("sidebar-collapsed");
        btn.textContent = collapsed ? "Show channels" : "Hide channels";
    });
}
