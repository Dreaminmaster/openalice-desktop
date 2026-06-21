use regex::Regex;

/// Find an available TCP port starting from the given port
pub fn find_available_port(start_port: u16) -> Result<u16, String> {
    for port in start_port..start_port + 20 {
        if is_port_available(port) {
            return Ok(port);
        }
    }
    Err(format!(
        "No available port in range {}-{}",
        start_port,
        start_port + 19
    ))
}

/// Check if a port is available
pub fn is_port_available(port: u16) -> bool {
    std::net::TcpListener::bind(("127.0.0.1", port)).is_ok()
}

/// Check if a specific port is in use
pub fn is_port_in_use(port: u16) -> bool {
    !is_port_available(port)
}

/// Sanitize sensitive data from log output
pub fn sanitize_logs(input: &str) -> String {
    let patterns = vec![
        (r"(api_key|apikey)\s*[:=]\s*\S+", "***REDACTED_API_KEY***"),
        (r"(secret)\s*[:=]\s*\S+", "***REDACTED_SECRET***"),
        (r"(token)\s*[:=]\s*\S+", "***REDACTED_TOKEN***"),
        (r"(password|passwd)\s*[:=]\s*\S+", "***REDACTED_PASSWORD***"),
        (r"Authorization:\s*Bearer\s+\S+", "Authorization: Bearer ***REDACTED***"),
    ];

    let mut result = input.to_string();
    for (pattern, replacement) in patterns {
        if let Ok(re) = Regex::new(pattern) {
            result = re.replace_all(&result, replacement).to_string();
        }
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sanitize_api_key() {
        let log = "api_key=sk-12345abcde secret=xyz123";
        let sanitized = sanitize_logs(log);
        assert!(sanitized.contains("***REDACTED_API_KEY***"));
        assert!(sanitized.contains("***REDACTED_SECRET***"));
        assert!(!sanitized.contains("12345abcde"));
        assert!(!sanitized.contains("xyz123"));
    }

    #[test]
    fn test_sanitize_bearer_token() {
        let log = "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.token";
        let sanitized = sanitize_logs(log);
        assert!(sanitized.contains("***REDACTED***"));
        assert!(!sanitized.contains("eyJhbGci"));
    }

    #[test]
    fn test_is_port_available() {
        // Port 0 lets OS assign any available port
        assert!(is_port_available(0));
    }
}
