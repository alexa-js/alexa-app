import { danger, warn } from "danger"

// did you forget to update changelog?
const hasChangelog = danger.git.modified_files.includes("CHANGELOG.md");
if (! hasChangelog) {
  warn("Did you forget to update CHANGELOG.md?");
}
