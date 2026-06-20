use std::collections::BTreeSet;

fn contains_any(text: &str, candidates: &[&str]) -> bool {
    candidates.iter().any(|candidate| text.contains(candidate))
}

pub fn infer_target_roles(text: &str) -> Vec<String> {
    let text_lc = text.to_ascii_lowercase();
    let mut roles = BTreeSet::new();

    if contains_any(
        &text_lc,
        &["front", "frontend", "vue", "react", "angular", "ui"],
    ) {
        roles.insert("Frontend Developer");
    }

    if contains_any(
        &text_lc,
        &[
            "backend",
            "api",
            "microservice",
            "server-side",
            "distributed system",
        ],
    ) {
        roles.insert("Backend Developer");
    }

    if text_lc.contains("full stack")
        || (roles.contains("Frontend Developer") && roles.contains("Backend Developer"))
    {
        roles.insert("Full-Stack Developer");
    }

    if contains_any(
        &text_lc,
        &["devops", "kubernetes", "docker", "ci/cd", "infrastructure"],
    ) {
        roles.insert("DevOps Engineer");
    }

    if contains_any(
        &text_lc,
        &[
            "site reliability",
            "sre",
            "observability",
            "incident response",
        ],
    ) {
        roles.insert("Site Reliability Engineer");
    }

    if contains_any(
        &text_lc,
        &[
            "data engineer",
            "etl",
            "data pipeline",
            "data warehouse",
            "spark",
        ],
    ) {
        roles.insert("Data Engineer");
    }

    if contains_any(
        &text_lc,
        &[
            "data scientist",
            "machine learning",
            "ml",
            "data analysis",
            "modeling",
        ],
    ) {
        roles.insert("Data Scientist");
    }

    if contains_any(
        &text_lc,
        &[
            "ml engineer",
            "llm",
            "tensorflow",
            "pytorch",
            "feature engineering",
        ],
    ) {
        roles.insert("Machine Learning Engineer");
    }

    if contains_any(
        &text_lc,
        &[
            "qa",
            "quality assurance",
            "testing",
            "automation",
            "test strategy",
        ],
    ) {
        roles.insert("QA Engineer");
    }

    if contains_any(
        &text_lc,
        &[
            "mobile",
            "android",
            "ios",
            "react native",
            "flutter",
            "swift",
            "kotlin",
        ],
    ) {
        roles.insert("Mobile Developer");
    }

    if contains_any(
        &text_lc,
        &[
            "security",
            "application security",
            "pentest",
            "threat",
            "soc",
        ],
    ) {
        roles.insert("Security Engineer");
    }

    if contains_any(
        &text_lc,
        &["cloud", "aws", "azure", "gcp", "cloud architecture"],
    ) {
        roles.insert("Cloud Engineer");
    }

    if contains_any(
        &text_lc,
        &[
            "product manager",
            "roadmap",
            "stakeholder",
            "product strategy",
        ],
    ) {
        roles.insert("Product Manager");
    }

    roles.into_iter().map(str::to_string).collect()
}

