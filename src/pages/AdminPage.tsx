import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories, useCreateMarket } from '../hooks/useMarkets'
import { useWalletAuth } from '../hooks/useWalletAuth'
import { userService } from '../services/userService'
import { Save, X, AlertCircle, Shield, Lock, Upload, Image as ImageIcon } from 'lucide-react'
import RichTextEditor from '../components/RichTextEditor'
import { stripHtml } from '../utils/sanitizeHtml'

interface MarketFormData {
  question: string
  description: string
  category_id: string
  market_type: 'binary' | 'perpetual' | 'scalar'
  end_date: string
  resolution_source: string
  image_url: string
  tags: string
}

export default function AdminPage() {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()
  const createMarketMutation = useCreateMarket()
  const { user, isAuthenticated, isLoading: authLoading } = useWalletAuth()
  const [formData, setFormData] = useState<MarketFormData>({
    question: '',
    description: '',
    category_id: '',
    market_type: 'binary',
    end_date: '',
    resolution_source: 'You',
    image_url: '',
    tags: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof MarketFormData, string>>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Check admin access
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/90 border border-border/50 rounded-xl p-12 text-center card-shadow backdrop-blur-sm">
          <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to access the admin panel
          </p>
          <button
            onClick={() => navigate('/markets')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Markets
          </button>
        </div>
      </div>
    )
  }

  if (!user.is_admin) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card/90 border border-destructive/50 rounded-xl p-12 text-center card-shadow backdrop-blur-sm">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-2">
            Only administrators can create markets
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Your wallet address: {user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
          </p>
          <button
            onClick={() => navigate('/markets')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Go to Markets
          </button>
        </div>
      </div>
    )
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MarketFormData, string>> = {}

    if (!formData.question.trim()) {
      newErrors.question = 'Question is required'
    } else if (formData.question.length < 10) {
      newErrors.question = 'Question must be at least 10 characters'
    }

    const plainTextDescription = stripHtml(formData.description).trim()
    if (!plainTextDescription) {
      newErrors.description = 'Description is required'
    } else if (plainTextDescription.length < 20) {
      newErrors.description = 'Description must be at least 20 characters'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }

    if (formData.market_type !== 'perpetual' && !formData.end_date) {
      newErrors.end_date = 'End date is required for non-perpetual markets'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    let imageUrl = formData.image_url

    // Upload image if file is selected
    if (imageFile) {
      try {
        setUploadingImage(true)
        imageUrl = await userService.uploadAvatar(imageFile)
        setFormData(prev => ({ ...prev, image_url: imageUrl }))
      } catch (error) {
        console.error('Error uploading image:', error)
        setErrors({ image_url: error instanceof Error ? error.message : 'Failed to upload image' })
        setUploadingImage(false)
        return
      } finally {
        setUploadingImage(false)
      }
    }

    createMarketMutation.mutate(
      {
        question: formData.question,
        description: formData.description,
        category_id: formData.category_id,
        market_type: formData.market_type,
        end_date: formData.end_date || undefined,
        resolution_source: formData.resolution_source || undefined,
        image_url: imageUrl || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined
      },
      {
        onSuccess: (market) => {
          // Navigate to the new market
          navigate(`/markets/${market.id}`)
        },
        onError: (error: Error) => {
          console.error('Error creating market:', error)
          setErrors({ question: error.message })
        }
      }
    )
  }

  const handleChange = (field: keyof MarketFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image_url: 'File size must be less than 5MB' }))
        return
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image_url: 'Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.' }))
        return
      }

      setImageFile(file)
      setErrors(prev => ({ ...prev, image_url: undefined }))
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setFormData(prev => ({ ...prev, image_url: '' }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-bold gold-text gelio-font">Create New Market</h1>
        </div>
        <p className="text-muted-foreground">Add a new prediction market to the platform</p>
        <div className="mt-2 text-xs text-muted-foreground">
          Admin: {user.username || user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-4)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm">
          {/* Question */}
          <div className="mb-6">
            <label htmlFor="question" className="block text-sm font-medium mb-2">
              Market Question <span className="text-destructive">*</span>
            </label>
            <input
              id="question"
              type="text"
              value={formData.question}
              onChange={(e) => handleChange('question', e.target.value)}
              placeholder="e.g., Will Ethereum reach $4,000 before $2,500?"
              className={`w-full px-4 py-3 bg-muted/50 border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.question ? 'border-destructive' : 'border-border/50'
              }`}
            />
            {errors.question && (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.question}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              A clear, specific question that can be resolved
            </p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              placeholder="Provide detailed information about how this market resolves..."
              error={errors.description}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Use the toolbar to format text (bold, italic, lists, alignment, etc.)
            </p>
          </div>

          {/* Category and Market Type */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium mb-2">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                id="category"
                value={formData.category_id}
                onChange={(e) => handleChange('category_id', e.target.value)}
                className={`w-full px-4 py-3 bg-muted/50 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.category_id ? 'border-destructive' : 'border-border/50'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.category_id}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="market_type" className="block text-sm font-medium mb-2">
                Market Type <span className="text-destructive">*</span>
              </label>
              <select
                id="market_type"
                value={formData.market_type}
                onChange={(e) => handleChange('market_type', e.target.value as MarketFormData['market_type'])}
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="binary">Binary (Yes/No)</option>
                <option value="perpetual">Perpetual</option>
                <option value="scalar">Scalar</option>
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Perpetual markets never close
              </p>
            </div>
          </div>

          {/* End Date */}
          {formData.market_type !== 'perpetual' && (
            <div className="mb-6">
              <label htmlFor="end_date" className="block text-sm font-medium mb-2">
                End Date <span className="text-destructive">*</span>
              </label>
              <input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => handleChange('end_date', e.target.value)}
                className={`w-full px-4 py-3 bg-muted/50 border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.end_date ? 'border-destructive' : 'border-border/50'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.end_date}
                </p>
              )}
            </div>
          )}

          {/* Resolution Source */}
          <div className="mb-6">
            <label htmlFor="resolution_source" className="block text-sm font-medium mb-2">
              Resolution Source
            </label>
            <input
              id="resolution_source"
              type="text"
              value={formData.resolution_source}
              onChange={(e) => handleChange('resolution_source', e.target.value)}
              placeholder="e.g., You, API, Admin"
              className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Who or what will resolve this market
            </p>
          </div>

          {/* Image Upload */}
          <div className="mb-6">
            <label htmlFor="image" className="block text-sm font-medium mb-2">
              Market Image (Optional)
            </label>
            
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border/50">
                  <img
                    src={imagePreview}
                    alt="Market preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Image selected: {imageFile?.name}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <label
                  htmlFor="image"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 transition-colors bg-muted/20"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="mb-2 text-sm text-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF or WebP (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    id="image"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {formData.image_url && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ImageIcon className="w-4 h-4" />
                    <span>Or enter URL: {formData.image_url}</span>
                  </div>
                )}
              </div>
            )}
            
            {errors.image_url && (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.image_url}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Upload an image to represent this market (optional)
            </p>
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (Optional)
            </label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Separate tags with commas
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/markets')}
            className="px-6 py-3 border border-border/50 rounded-lg text-foreground hover:bg-muted/50 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMarketMutation.isPending || uploadingImage}
            className="px-6 py-3 gold-button rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Uploading image...
              </>
            ) : createMarketMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Market
              </>
            )}
          </button>
        </div>

        {/* Success/Error Messages */}
        {createMarketMutation.isError && (
          <div className="bg-destructive/10 border border-destructive/50 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error creating market</p>
              <p className="text-sm text-muted-foreground mt-1">
                {createMarketMutation.error instanceof Error 
                  ? createMarketMutation.error.message 
                  : 'An unexpected error occurred'}
              </p>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}

