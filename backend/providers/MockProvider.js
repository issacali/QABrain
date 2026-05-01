import BaseProvider from "./BaseProvider.js";

export default class MockProvider extends BaseProvider {
  async generateTestCases(requirement) {
    return {
      testCases: [
        {
          id: "TC001",
          scenario: "Valid API request with correct parameters",
          preconditions: "User has valid authentication credentials",
          steps: [
            "Send valid API request",
            "Verify response status",
            "Check response structure"
          ],
          expectedResult: "HTTP 200 with valid JSON response",
          type: "functional"
        },
        {
          id: "TC002",
          scenario: "Missing required field",
          preconditions: "API expects mandatory fields",
          steps: [
            "Send request without required field",
            "Observe error response"
          ],
          expectedResult: "HTTP 400 with validation error message",
          type: "negative"
        },
        {
          id: "TC003",
          scenario: "Invalid data type",
          preconditions: "Field expects string input",
          steps: [
            "Send numeric value for string field",
            "Verify error handling"
          ],
          expectedResult: "HTTP 422 with type validation error",
          type: "negative"
        },
        {
          id: "TC004",
          scenario: "Boundary value testing",
          preconditions: "API has input limits",
          steps: [
            "Test with minimum value",
            "Test with maximum value",
            "Test with edge values"
          ],
          expectedResult: "All boundary cases handled gracefully",
          type: "boundary"
        },
        {
          id: "TC005",
          scenario: "Performance under load",
          preconditions: "API should respond within timeout",
          steps: [
            "Send rapid sequential requests",
            "Measure response time",
            "Verify no timeouts"
          ],
          expectedResult: "Response time < 2 seconds",
          type: "performance"
        }
      ]
    };
  }

  async generateDefectReport(scenario) {
    return {
      summary: "Login button unresponsive on mobile",
      stepsToReproduce: [
        "Open application on mobile device",
        "Navigate to login page",
        "Click login button",
        "Observe behavior"
      ],
      expectedResult: "Login page should load and submit credentials",
      actualResult: "Button click has no effect, page remains frozen",
      severity: "High",
      priority: "Critical",
      environment: "Mobile Chrome, Android 14",
      rootCause: "JavaScript event handler not properly attached to mobile viewport"
    };
  }
}
