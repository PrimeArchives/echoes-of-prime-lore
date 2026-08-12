# Canonical WikiLinks

Local Quartz transformer for Prime Archives.

Add to `quartz.config.yaml` before Obsidian Flavored Markdown:

```yaml
  - source: "./plugins/canonical-wikilinks"
    enabled: true
    order: 25
```

Examples:

`[[Rust Bucket]]` is resolved by `title:` or `aliases:` and rewritten to the
real canonical note path before Quartz parses the wikilink.

Existing explicit path links are left untouched.
