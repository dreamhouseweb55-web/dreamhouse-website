// ===================================
// NAVBAR ENHANCEMENTS
// ===================================

export function initNavbarEnhancements() {
    handleMobileDropdowns();

    // Re-check on resize
    window.addEventListener('resize', () => {
        handleMobileDropdowns();
    });
}

function handleMobileDropdowns() {
    const isMobile = window.innerWidth < 992;
    const dropdownToggles = document.querySelectorAll('.navbar-nav .dropdown-toggle');
    const dropdownMenus = document.querySelectorAll('.navbar-nav .dropdown-menu');

    // Always remove data-bs-toggle to allow clicking the parent link to navigate
    // relying on CSS :hover for desktop menu display
    dropdownToggles.forEach(toggle => {
        toggle.removeAttribute('data-bs-toggle');
        // We can leave aria-expanded or manage it manually if needed, 
        // but removing the toggle behavior is the key.
    });

    if (isMobile) {
        // Mobile: Hide menus completely
        dropdownMenus.forEach(menu => {
            (menu as HTMLElement).style.display = 'none';
        });
    } else {
        // Desktop: Allow menus to be shown via CSS hover
        dropdownMenus.forEach(menu => {
            (menu as HTMLElement).style.display = '';
        });
    }
}

