#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedResume {
    pub file_path: String,
    pub file_name: String,
    pub extension: String,
    pub extracted_text: String,
    pub detected_skills: Vec<String>,
    pub inferred_target_roles: Vec<String>,
}
