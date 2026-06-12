use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, AppHandle, Manager,
};

use crate::dev_mode::resolve_dev_mode;

/// Shows the main window and focuses it.
pub fn show_main_window(app: &AppHandle, open_devtools: bool) {
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.show();
        let _ = main.set_focus();

        if open_devtools {
            main.open_devtools();
        }
    }
}

/// Hides the main window.
/// Used as a defensive startup guard before app initialization completes.
#[tauri::command]
pub fn hide_main_window(app: AppHandle) {
    if let Some(main) = app.get_webview_window("main") {
        let _ = main.hide();
    }
}

/// Closes the splashscreen window and shows the main window.
/// Called from the frontend once initialization is complete.
#[tauri::command]
pub fn close_splashscreen(app: AppHandle) {
    if let Some(splash) = app.get_webview_window("splashscreen") {
        let _ = splash.close();
    }

    show_main_window(&app, resolve_dev_mode());
}

/// Configures tray behavior and startup hidden state for the main window.
pub fn setup_tray(app: &mut App, open_devtools: bool) -> tauri::Result<()> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }

    let show = MenuItem::with_id(app, "show", "Show", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show, &quit])?;

    let tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "show" => {
                show_main_window(app, open_devtools);
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(move |tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();

                show_main_window(&app, open_devtools);
            }
        })
        .build(app)?;

    app.manage(tray);

    Ok(())
}
