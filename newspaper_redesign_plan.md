# Newspaper Layout Redesign Plan for layoutOne.jsx

## Current Issues (based on newspaper image analysis):

### 1. **Header Section** (✓ Already correct)
- Newspaper name with date/edition
- Keep as is

### 2. **Main Content Area - 3 Column Layout** (❌ Needs Redesign)

**Current Problem:**
- center_top is one large block with 3 internal columns
- Doesn't match real newspaper structure

**Required Structure (based on image):**

```
┌─────────────────────────────────────────────────────┐
│  LEFT COLUMN (27%)  │  CENTER COLUMN (46%)  │ RIGHT │
│                     │                        │ COL   │
│ ┌─────────────────┐ │ ┌────────────────────┐ │ (27%) │
│ │ Small Article 1 │ │ │                    │ │       │
│ │ with headline   │ │ │  MAIN FEATURED    │ │ Small │
│ │                 │ │ │  ARTICLE          │ │ Arti- │
│ │ [Image]         │ │ │                    │ │ cle 3 │
│ │ Body text...    │ │ │  [Large Image]    │ │       │
│ │                 │ │ │                    │ │ [Img] │
│ └─────────────────┘ │ │  Headline text    │ │       │
│                     │ │  flows across top │ │ Body │
│ ┌─────────────────┐ │ │                    │ │ text │
│ │ Small Article 2 │ │ │  Body in 2 cols   │ │ ...  │
│ │                 │ │ │  or 3 cols        │ │      │
│ │ Body text...    │ │ │                    │ │      │
│ └─────────────────┘ │ └────────────────────┘ │      │
│                     │                        │      │
│ ┌─────────────────┐ │                        │      │
│ │ Article 3       │ │                        │      │
│ │                 │ │                        │      │
│ └─────────────────┘ │                        │      │
└─────────────────────────────────────────────────────┘
```

### 3. **Column Specifications:**

#### **Left Column (27% width)**
- Multiple small articles stacked vertically
- Each article: Headline + Body text + optional small image
- Thin horizontal borders between articles
- Articles flow top to bottom

#### **Center Column (46% width) - MAIN FEATURE**
- **Top**: Large headline spanning full width (centered, bold)
- **Below headline**: Main article body in 2-3 columns
- **Image placement**: 
  - Option A: Image at top, text flows below in columns
  - Option B: Image on left side, text on right (if 2 columns)
  - Option C: Image centered, text wraps around (if 3 columns)
- This is the "center_top" section - needs complete redesign

#### **Right Column (27% width)**
- Similar to left column - multiple small articles
- Some articles may have small thumbnail images
- Thin borders between articles
- Articles flow top to bottom

### 4. **Article Component Structure:**

Each article needs:
```
┌─────────────────────────┐
│ HEADLINE (Bold, 14-16px)│
│ Subtitle/Category       │
├─────────────────────────┤
│                         │
│  [Image - if present]   │
│                         │
│  Body text in columns   │
│  (2 or 3 columns based  │
│   on article importance)│
│                         │
│  - Reporter name        │
│  - Date                 │
└─────────────────────────┘
```

### 5. **Vertical Dividers:**
- Line 1: Between Left and Center column (at 27%)
- Line 2: Between Center and Right column (at 73%)
- Color: #999 or #ccc
- Width: 1px
- Full height of content area

### 6. **Horizontal Borders:**
- Between each article in left/right columns
- Thin lines (1px, #ccc or #ddd)
- Margin: 4-8px between articles

### 7. **Image Placement Rules:**
- **Main article (center)**: Large image (width: 100% of column, height: 180-220px)
- **Side articles (left/right)**: Small images (width: 100%, height: 100-120px) or thumbnails
- Images have border: 1px solid #777
- Images are part of article block, not separate

### 8. **Typography:**
- **Main Headline**: 20-24px, bold, centered
- **Article Headlines**: 14-16px, bold, left-aligned
- **Body text**: 11-12px, justified, line-height 18-20px
- **Byline**: 8-9px, italic, at bottom of article

## Implementation Plan:

### Step 1: Redesign layoutOne.jsx Structure
- Keep header section as is
- Redesign mainRow to have 3 separate columns (left, center, right)
- Each column is a flex container
- Remove current center_top/midRow complexity

### Step 2: Create New Column Structure
```jsx
<div style={styles.mainRow}>
  {/* Left Column - Multiple Articles */}
  <div style={styles.leftColumn}>
    <ArticleBlock data={sections.left_article1} />
    <div style={styles.horizontalBorder} />
    <ArticleBlock data={sections.left_article2} />
    <div style={styles.horizontalBorder} />
    <ArticleBlock data={sections.left_article3} />
  </div>
  
  {/* Vertical Divider 1 */}
  <div style={styles.verticalDivider} />
  
  {/* Center Column - Main Feature */}
  <div style={styles.centerColumn}>
    <div style={styles.mainHeadline}>
      {sections.center_top?.headline || 'Main Headline'}
    </div>
    <ArticleBlock 
      data={sections.center_top} 
      isMain 
      showColumnBorders
    />
  </div>
  
  {/* Vertical Divider 2 */}
  <div style={styles.verticalDivider} />
  
  {/* Right Column - Multiple Articles */}
  <div style={styles.rightColumn}>
    <ArticleBlock data={sections.right_article1} />
    <div style={styles.horizontalBorder} />
    <ArticleBlock data={sections.right_article2} />
  </div>
</div>
```

### Step 3: Update Styles
- Add `leftColumn`, `centerColumn`, `rightColumn` styles
- Add `verticalDivider` style (full height, 1px, #999)
- Add `horizontalBorder` style (1px, #ccc, margin)
- Update `centerTop` to remove padding (already done)
- Ensure proper flex ratios: 27:46:27

### Step 4: ArticleBlock Updates
- Ensure images display within article flow
- Support for 2-column body text in main article
- Proper borders when showColumnBorders is true

### Step 5: Data Structure
Update newspaperStore.js to support:
- left_article1, left_article2, left_article3
- center_top (main featured article)
- right_article1, right_article2, right_article3

## Visual Reference from Image:

**Key Observations:**
1. Main headline is SEPARATE from article body - spans full center column width
2. Center column has ONE main article with image
3. Left and right columns have MULTIPLE smaller articles
4. All articles have consistent structure: Headline → Body → Byline
5. Images are INTEGRATED into articles, not separate blocks
6. Thin lines separate articles horizontally
7. Thicker vertical lines separate the 3 main columns

## Next Steps:
1. Redesign layoutOne.jsx with proper 3-column structure
2. Update styles for vertical/horizontal dividers
3. Test with sample data to ensure proper text flow
4. Verify images display correctly within articles