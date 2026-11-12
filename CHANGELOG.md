# Changelog

## Version v1.2.0

Released on 2026-09-15.

### Bookmarks

<!-- prettier-ignore -->
- Restore centered content and folder spacing, and align the add-bookmark icon
    and label with the bookmark rows.
- Keep bookmark order consistent between the editing preview and saved folders
    when moving an item downward within the same folder.
- Preserve unrelated settings changed in another tab while saving edits, and
    prevent simultaneous Min saves from overwriting each other's bookmark edits.
- Keep successful edits when retrying after a partial save failure.
- Preserve supported address schemes, including file and mail links, and show an
    error for unsupported schemes instead of changing them into web addresses.
- Arrange folders in rows and resizable columns, resize folder heights, and double-click a resize handle to reset it.
- Choose list or grid view, icon style, titles and domain visibility for each folder. Grid tiles are more compact.
- Keep folders collapsed after reloading or opening a new tab. Dropping an item or folder onto itself keeps it in place.
- Edit with undo, redo, save and cancel. Close an add form by moving to another control.
- Adding the same address to the same folder shows a notification instead of creating a duplicate, including bookmarks not yet saved in edit mode.
- Bookmark input and save errors appear below the fields without clearing your entries. Repeated submissions are blocked while saving, and location searches distinguish loading from errors.
- Use the table of contents to navigate to folders and reveal their names on hover or keyboard focus. A clicked item stays highlighted until you manually scroll. The destination folder outline fades after a short delay while the table-of-contents selection and keyboard focus remain.
- Fixed invisible add-column areas intercepting drag handles in multi-column layouts.

### Search and navigation

<!-- prettier-ignore -->
- Focused search and bookmark editors highlight only their bottom border, without
    overlapping outlines or extra lines around individual fields.
- Find bookmarks with search suggestions and choose Google, Bing, DuckDuckGo or Brave.
- Navigate bookmarks with arrow keys, focus search with /, and enter editing with E. Escape leaves search focus and opens settings when idle. Editing restores focus, with improved screen-reader guidance.
- Use browser back and forward navigation in settings detail screens and update history.

### Weather

- View weather for a searched city or your location. Choose Celsius or Fahrenheit and whether to show the city. Cached weather avoids repeated requests.

### Settings

<!-- prettier-ignore -->
- Shared controls now use bolerish's design system while keeping Min's compact
    layout, custom fonts, text scales, and corner settings.
- Appearance changes also apply to other open Min tabs. A settings read failure
    no longer prevents the new tab page from opening or replaces saved settings.
- Set heading and content fonts separately, adjust content width, and choose from five languages. Toggle folder dividers and keyboard shortcuts in Layout.
- Keep the header right-aligned on mobile and the settings button on the right when shortcuts are hidden.
- Choose whether to show the date and time and select their formats. Time options show examples, and custom date formats include examples and error guidance.
- Choose light, dark, or system themes, and turn animations on, off, or follow system settings. Saved themes are applied before new-tab content loads.

### Updates

- After a version update, a one-time message appears when you first open a new tab. Use its button to read the update history.

## Version v1.1.3

Released on 2026-08-25.

- Moved settings from a dropdown menu to a left sidebar.
- Dragging a bookmark now pushes nearby bookmarks aside to preview its new
  position.
- Bookmark folders now expand and collapse as accordions.
- You can now choose nested folders, not just root folders, when saving a
  bookmark.
