// Не показываем отдельное консольное окно в Windows release-сборке.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    blazon_please_lib::run();
}
