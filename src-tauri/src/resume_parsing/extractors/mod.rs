use std::path::Path;

mod docx;
mod pdf;

use docx::extract_docx_text;
use pdf::extract_pdf_text;

pub fn read_resume_text(path: &Path, extension: &str) -> Result<String, String> {
    match extension {
        "pdf" => extract_pdf_text(path),
        "docx" => extract_docx_text(path),
        _ => Err("Only PDF and DOCX files are supported".to_string()),
    }
}
