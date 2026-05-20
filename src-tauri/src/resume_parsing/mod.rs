mod analyzers;
mod extractors;
mod types;

use std::path::Path;

use analyzers::{detect_skills, infer_target_roles};
use extractors::read_resume_text;
pub use types::ParsedResume;

#[allow(non_snake_case)]
#[tauri::command]
pub fn parse_resume_for_ats(filePath: String) -> Result<ParsedResume, String> {
    let path = Path::new(&filePath);
    if !path.exists() {
        return Err("Selected resume file does not exist".to_string());
    }

    let extension = path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase();

    let extracted_text = read_resume_text(path, extension.as_str())?;
    let detected_skills = detect_skills(&extracted_text);
    let inferred_target_roles = infer_target_roles(&extracted_text);

    let file_name = path
        .file_name()
        .and_then(|name| name.to_str())
        .unwrap_or("resume")
        .to_string();

    Ok(ParsedResume {
        file_path: filePath,
        file_name,
        extension,
        extracted_text,
        detected_skills,
        inferred_target_roles,
    })
}
