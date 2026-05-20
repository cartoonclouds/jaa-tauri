use std::path::Path;

pub fn extract_pdf_text(path: &Path) -> Result<String, String> {
    pdf_extract::extract_text(path).map_err(|error| format!("Failed to parse PDF: {error}"))
}
