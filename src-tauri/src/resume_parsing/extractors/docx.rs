use regex::Regex;
use std::fs::File;
use std::io::Read;
use std::path::Path;

pub fn extract_docx_text(path: &Path) -> Result<String, String> {
    let file = File::open(path).map_err(|error| format!("Failed to open DOCX: {error}"))?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|error| format!("Failed to read DOCX archive: {error}"))?;
    let mut xml_file = archive
        .by_name("word/document.xml")
        .map_err(|error| format!("Invalid DOCX content: {error}"))?;

    let mut xml = String::new();
    xml_file
        .read_to_string(&mut xml)
        .map_err(|error| format!("Failed to read DOCX XML: {error}"))?;

    let xml_with_line_breaks = xml
        .replace("</w:p>", "\n")
        .replace("</w:tr>", "\n")
        .replace("<w:tab/>", " ");

    let tag_regex = Regex::new(r"<[^>]+>").map_err(|error| format!("Regex failure: {error}"))?;
    let text_without_tags = tag_regex.replace_all(&xml_with_line_breaks, " ");

    let normalized = text_without_tags
        .lines()
        .map(|line| line.split_whitespace().collect::<Vec<_>>().join(" "))
        .filter(|line| !line.is_empty())
        .collect::<Vec<_>>()
        .join("\n");

    Ok(normalized)
}
