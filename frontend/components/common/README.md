# Common Components

Reusable UI components that can be used throughout the platform.

## ConfirmModal

A beautiful, accessible confirmation modal that follows the design system.

### Features
- ✅ Consistent design with the platform
- ✅ Dark mode support
- ✅ Three types: danger, warning, info
- ✅ Loading state support
- ✅ Smooth animations
- ✅ Backdrop blur effect
- ✅ Keyboard accessible (ESC to close)

### Usage

```tsx
import ConfirmModal from '../common/ConfirmModal';

function MyComponent() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      // Your delete logic here
      await deleteResource();
      setShowConfirm(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setShowConfirm(true)}>
        Delete
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Resource"
        message="Are you sure you want to delete this resource? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | required | Controls modal visibility |
| `onClose` | `() => void` | required | Called when modal should close |
| `onConfirm` | `() => void` | required | Called when user confirms action |
| `title` | `string` | optional | Modal title |
| `message` | `string` | required | Confirmation message |
| `confirmText` | `string` | `"OK"` | Confirm button text |
| `cancelText` | `string` | `"Cancel"` | Cancel button text |
| `type` | `'danger' \| 'warning' \| 'info'` | `'danger'` | Modal type (affects colors) |
| `loading` | `boolean` | `false` | Shows loading state, disables buttons |

### Types

#### Danger (Red)
Use for destructive actions like delete, remove, etc.
```tsx
<ConfirmModal type="danger" message="Delete this item?" />
```

#### Warning (Yellow)
Use for actions that need caution but aren't destructive.
```tsx
<ConfirmModal type="warning" message="This will affect multiple users." />
```

#### Info (Indigo)
Use for informational confirmations.
```tsx
<ConfirmModal type="info" message="Proceed with this action?" />
```

### Examples

#### Simple Delete Confirmation
```tsx
<ConfirmModal
  isOpen={showDelete}
  onClose={() => setShowDelete(false)}
  onConfirm={handleDelete}
  message="Are you sure you want to delete this resource?"
  type="danger"
/>
```

#### With Title and Loading
```tsx
<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleAction}
  title="Confirm Action"
  message="This will send notifications to all students. Continue?"
  confirmText="Send Notifications"
  cancelText="Go Back"
  type="warning"
  loading={sending}
/>
```

#### Custom Button Text
```tsx
<ConfirmModal
  isOpen={showPublish}
  onClose={() => setShowPublish(false)}
  onConfirm={handlePublish}
  title="Publish Resource"
  message="Make this resource available to all students?"
  confirmText="Publish Now"
  cancelText="Not Yet"
  type="info"
/>
```

### Styling

The modal automatically adapts to:
- Light/Dark mode
- Mobile/Desktop screens
- Different content lengths

Colors are pulled from the design system:
- Danger: Red (destructive actions)
- Warning: Yellow (caution needed)
- Info: Secondary/Indigo (informational)

### Accessibility

- Clicking backdrop closes modal
- ESC key closes modal (browser default)
- Focus trap within modal
- Proper ARIA labels
- Keyboard navigation support
