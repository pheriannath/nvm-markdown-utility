import { useState, useEffect } from "react";
import { Remarkable } from "remarkable";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

const App = () => {
  const [markdown, setMarkdown] = useState("");
  const [json, setJson] = useState("");
  const [showCopied, setShowCopied] = useState(false);
  const [showError, setShowError] = useState(false);

  // Matches production ruleset
  const renderMarkdownToHTML = (markdown) => {
    const remarkable = new Remarkable({
      html: false,
      breaks: true,
      typographer: true,
    });

    remarkable.inline.ruler.disable([
      "backticks",
      "del",
      "footnote_ref",
      "links", // also disables images
    ]);
    remarkable.block.ruler.disable([
      "blockquote",
      "code",
      "deflist",
      "fences",
      "footnote",
      "table",
    ]);

    const renderedHTML = remarkable.render(markdown);
    return { __html: renderedHTML };
  };

  const convertMarkdownToJson = () => {
    if (!markdown) return "";

    // Handle different types of line breaks
    let oneLine = markdown
      .replace(/\r\n/g, "\\n") // Windows line breaks
      .replace(/\n/g, "\\n") // Unix line breaks
      .replace(/\r/g, "\\n"); // Mac (old) line breaks

    // Escape double quotes to prevent JSON parsing issues
    oneLine = oneLine.replace(/"/g, '\\"');

    setJson(oneLine);
  };

  const copyToClipboard = (text) => {
    return new Promise((resolve, reject) => {
      try {
        // Use the modern Clipboard API if available
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard
            .writeText(text)
            .then(() => {
              resolve(true);
              setShowCopied(true);
            })
            .catch((err) => {
              reject(err);
              setShowError(true);
            });
        } else {
          // Fallback for older browsers or non-secure contexts
          const textarea = document.createElement("textarea");
          textarea.value = text;

          // Make the textarea out of viewport
          textarea.style.position = "fixed";
          textarea.style.left = "-999999px";
          textarea.style.top = "-999999px";
          document.body.appendChild(textarea);

          // Select and copy
          textarea.focus();
          textarea.select();
          const success = document.execCommand("copy");

          // Clean up
          document.body.removeChild(textarea);

          if (success) {
            setShowCopied(true);
            resolve(true);
          } else {
            setShowError(true);
            reject(new Error("Failed to copy text"));
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  };

  const reset = () => {
    setMarkdown("");
    setJson("");
    setShowCopied(false);
    setShowError(false);
  };

  return (
    <div className="container">
      <Typography variant="h3">NVM Markdown Utility</Typography>

      <Box sx={{ flexGrow: 1, marginTop: "2rem", marginBottom: "2rem" }}>
        <Grid container spacing={4}>
          <Grid size={6}>
            <TextareaAutosize
              onChange={(e) => setMarkdown(e.target.value)}
              value={markdown}
              minRows={10}
              placeholder="Start typing some Markdown and it will appear to the right."
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid size={6}>
            <div dangerouslySetInnerHTML={renderMarkdownToHTML(markdown)} />
          </Grid>
        </Grid>
      </Box>

      <Box
        sx={{ display: "flex", flexGrow: 1, alignItems: "center", gap: "1rem" }}
      >
        <Button
          sx={{ whiteSpace: "nowrap" }}
          variant="outlined"
          size="normal"
          onClick={() => convertMarkdownToJson()}
        >
          Convert to JSON
        </Button>

        <TextField
          sx={{ flexGrow: 1 }}
          size="small"
          value={json}
          readOnly
          hiddenLabel
        />

        <div>
          <Button
            sx={{ whiteSpace: "nowrap" }}
            variant="outlined"
            onClick={() => copyToClipboard(json)}
          >
            Copy to Clipboard
          </Button>
          {showCopied && <div>Copied!</div>}
          {showError && <div>There was an error copying the text.</div>}
        </div>
      </Box>

      <Button
        sx={{ marginTop: "2rem" }}
        color="secondary"
        onClick={() => reset()}
      >
        Reset
      </Button>
    </div>
  );
};

export default App;
