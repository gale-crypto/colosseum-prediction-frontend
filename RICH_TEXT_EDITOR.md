# Rich Text Editor Integration

## ✅ Rich Text Editing Implemented

The market description field now supports rich text formatting with a full-featured editor.

## 📦 Installed Packages

- `react-quill` - Rich text editor component
- `dompurify` - HTML sanitization for security
- `@types/dompurify` - TypeScript types

## 🎨 Features Available

### Text Formatting
- **Bold** - Make text bold
- **Italic** - Make text italic
- **Underline** - Underline text
- **Strikethrough** - Cross out text

### Headers
- H1, H2, H3 - Different heading sizes

### Lists
- **Ordered Lists** - Numbered lists
- **Bullet Lists** - Bulleted lists

### Alignment
- Left, Center, Right, Justify

### Links
- Add hyperlinks to text

### Colors
- Text color
- Background color

### Other
- Clean formatting (remove all formatting)

## 🔧 Implementation Details

### RichTextEditor Component
Located at: `src/components/RichTextEditor.tsx`

Features:
- Custom styled toolbar
- Theme-aware (matches your app's color scheme)
- Error handling
- Placeholder support

### HTML Sanitization
Located at: `src/utils/sanitizeHtml.ts`

Security features:
- Sanitizes HTML to prevent XSS attacks
- Allows only safe HTML tags
- Strips dangerous scripts and attributes
- Validates URLs

### Usage in AdminPage
The description field now uses `RichTextEditor` instead of a plain textarea.

### Rendering in MarketDetailPage
HTML content is safely rendered using `dangerouslySetInnerHTML` with sanitization.

## 📝 How to Use

### Creating a Market with Rich Text

1. Go to `/admin` page
2. Fill in the market question
3. Click in the **Description** field
4. Use the toolbar to format text:
   - Select text and click formatting buttons
   - Or type and format as you go
5. Use features like:
   - **Bold** important points
   - Create **lists** for rules
   - Add **headers** for sections
   - **Align** text as needed
6. Submit the form

### Example Formatting

```
Market Rules:

• This market resolves to YES if...
• The market uses CoinGecko as the price source
• Prices are checked every hour

Important: This market will never be cancelled.
```

Can be formatted with:
- Headers for "Market Rules:"
- Bullet lists for rules
- Bold for "Important:"

## 🔒 Security

### HTML Sanitization
All HTML content is sanitized before:
- Saving to database
- Rendering on the page

### Allowed Tags
- Text: `p`, `br`, `strong`, `em`, `u`, `s`
- Headers: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- Lists: `ul`, `ol`, `li`
- Links: `a` (with safe URLs)
- Containers: `div`, `span`, `blockquote`

### Blocked Content
- Scripts (`<script>`)
- Iframes (`<iframe>`)
- Dangerous attributes (`onclick`, etc.)
- Unsafe URLs

## 🎨 Styling

The rich text editor matches your app's theme:
- Uses CSS variables for colors
- Dark mode compatible
- Responsive design
- Custom toolbar styling

Prose styles are added to `index.css` for consistent rendering.

## 📊 Validation

The form validation:
- Strips HTML tags for length checking
- Requires at least 20 characters of actual text
- Shows errors if validation fails

## 🐛 Troubleshooting

### Editor Not Showing
1. Check if `react-quill` is installed: `yarn install`
2. Check browser console for errors
3. Verify CSS is loaded

### Formatting Not Saving
1. Check if HTML is being saved to database
2. Verify sanitization isn't removing too much
3. Check browser console for errors

### Styling Issues
1. Check if `index.css` is imported
2. Verify CSS variables are defined
3. Check browser DevTools for CSS conflicts

## 🔮 Future Enhancements

Possible additions:
1. **Image Upload** - Add images to descriptions
2. **Code Blocks** - Syntax highlighting
3. **Tables** - Add tables for data
4. **Mentions** - @mention users
5. **Markdown Support** - Import/export Markdown
6. **Templates** - Pre-formatted templates

## 📚 Related Files

- `src/components/RichTextEditor.tsx` - Editor component
- `src/utils/sanitizeHtml.ts` - HTML sanitization
- `src/pages/AdminPage.tsx` - Uses editor
- `src/pages/MarketDetailPage.tsx` - Renders HTML
- `src/index.css` - Prose styles

