import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCategories, useCreateMarket } from '../hooks/useMarkets'
import { useWalletAuth } from '../hooks/useWalletAuth'
import { useAppKitProvider } from '@reown/appkit/react'
import { userService } from '../services/userService'
import { paymentService } from '../services/paymentService'
import { Save, X, AlertCircle, Upload, Plus, Trash2, DollarSign } from 'lucide-react'
import RichTextEditor from '../components/RichTextEditor'
import { stripHtml } from '../utils/sanitizeHtml'

interface MarketFormData {
  question: string
  description: string
  category_id: string
  market_type: 'perpetual' | 'hits' | 'time_scalar'
  market_method: 'binary' | 'multi_choice'
  end_date: string
  resolution_source_url: string
  resolution_source_name: string
  image_url: string
  tags: string
  payment_options: string[] // ['USDT', 'SOL']
  custom_labels: { up: string; down: string }
  multi_choice_options: string[]
  badge: string
}

const BADGE_OPTIONS = [
  'Sentiment',
  'Points',
  'New Years Special',
  'Featured',
  'Hot',
  'Trending'
]

export default function CreateMarketPage() {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()
  const createMarketMutation = useCreateMarket()
  const { user, isAuthenticated, isLoading: authLoading } = useWalletAuth()
  const { walletProvider } = useAppKitProvider('solana')
  
  const [formData, setFormData] = useState<MarketFormData>({
    question: '',
    description: '',
    category_id: '',
    market_type: 'perpetual',
    market_method: 'binary',
    end_date: '',
    resolution_source_url: '',
    resolution_source_name: '',
    image_url: '',
    tags: '',
    payment_options: ['USDT', 'SOL'],
    custom_labels: { up: 'UP', down: 'DOWN' },
    multi_choice_options: [],
    badge: ''
  })
  
  const [errors, setErrors] = useState<Partial<Record<keyof MarketFormData | 'payment' | 'multi_choice', string>>>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [newMultiChoiceOption, setNewMultiChoiceOption] = useState('')

  const isAdmin = user?.is_admin || false
  const creationFee = paymentService.getCreationFee()

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
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">
            Please connect your wallet to create a market
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
    const newErrors: Partial<Record<keyof MarketFormData | 'payment' | 'multi_choice', string>> = {}

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

    if (formData.payment_options.length === 0) {
      newErrors.payment = 'At least one payment option is required'
    }

    if (formData.market_method === 'binary') {
      if (!formData.custom_labels.up.trim() || !formData.custom_labels.down.trim()) {
        newErrors.custom_labels = 'Both labels are required for binary markets'
      }
    } else if (formData.market_method === 'multi_choice') {
      if (formData.multi_choice_options.length < 2) {
        newErrors.multi_choice = 'At least 2 options are required for multi-choice markets'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Process payment if not admin
    if (!isAdmin && walletProvider) {
      try {
        setProcessingPayment(true)
        await paymentService.payMarketCreationFee(walletProvider, creationFee)
      } catch (error) {
        console.error('Payment error:', error)
        setErrors({ payment: error instanceof Error ? error.message : 'Payment failed' })
        setProcessingPayment(false)
        return
      } finally {
        setProcessingPayment(false)
      }
    }

    let imageUrl = formData.image_url

    // Upload image if file is selected
    if (imageFile) {
      try {
        setUploadingImage(true)
        imageUrl = await userService.uploadAvatar(imageFile)
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
        market_method: formData.market_method,
        end_date: formData.end_date || undefined,
        resolution_source_url: formData.resolution_source_url || undefined,
        resolution_source_name: formData.resolution_source_name || undefined,
        image_url: imageUrl || undefined,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : undefined,
        payment_options: formData.payment_options,
        custom_labels: formData.market_method === 'binary' ? formData.custom_labels : undefined,
        multi_choice_options: formData.market_method === 'multi_choice' ? formData.multi_choice_options : undefined,
        badge: formData.badge || undefined,
        creation_fee_paid: !isAdmin,
        creation_fee_amount: isAdmin ? 0 : creationFee
      },
      {
        onSuccess: (market) => {
          navigate(`/markets/${market.id}`)
        },
        onError: (error: Error) => {
          console.error('Error creating market:', error)
          setErrors({ question: error.message })
        }
      }
    )
  }

  const handleChange = (field: keyof MarketFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handlePaymentOptionToggle = (option: string) => {
    setFormData(prev => ({
      ...prev,
      payment_options: prev.payment_options.includes(option)
        ? prev.payment_options.filter(o => o !== option)
        : [...prev.payment_options, option]
    }))
  }

  const addMultiChoiceOption = () => {
    if (newMultiChoiceOption.trim() && !formData.multi_choice_options.includes(newMultiChoiceOption.trim())) {
      setFormData(prev => ({
        ...prev,
        multi_choice_options: [...prev.multi_choice_options, newMultiChoiceOption.trim()]
      }))
      setNewMultiChoiceOption('')
    }
  }

  const removeMultiChoiceOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      multi_choice_options: prev.multi_choice_options.filter((_, i) => i !== index)
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image_url: 'File size must be less than 5MB' }))
        return
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image_url: 'Invalid file type' }))
        return
      }
      setImageFile(file)
      setErrors(prev => ({ ...prev, image_url: undefined }))
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
        <h1 className="text-3xl font-bold gold-text gelio-font mb-2">Create New Market</h1>
        <p className="text-muted-foreground">Create a prediction market for others to trade</p>
        {!isAdmin && (
          <div className="mt-3 p-3 bg-muted/50 border border-border/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-medium">Creation Fee: {creationFee} SOL</span>
              <span className="text-muted-foreground">(Free for admins)</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card/90 border border-border/50 rounded-xl p-6 card-shadow backdrop-blur-sm space-y-6">
          {/* Question */}
          <div>
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
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description <span className="text-destructive">*</span>
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              placeholder="Provide detailed information..."
              error={errors.description}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Category and Market Type */}
          <div className="grid md:grid-cols-2 gap-6">
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
                <option value="perpetual">Perpetual</option>
                <option value="hits">Hits</option>
                <option value="time_scalar">Time Scalar</option>
              </select>
            </div>
          </div>

          {/* Market Method */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Market Method <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="market_method"
                  value="binary"
                  checked={formData.market_method === 'binary'}
                  onChange={(e) => handleChange('market_method', e.target.value as 'binary' | 'multi_choice')}
                  className="w-4 h-4"
                />
                <span>Binary (Two Options)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="market_method"
                  value="multi_choice"
                  checked={formData.market_method === 'multi_choice'}
                  onChange={(e) => handleChange('market_method', e.target.value as 'binary' | 'multi_choice')}
                  className="w-4 h-4"
                />
                <span>Multi-Choice</span>
              </label>
            </div>
          </div>

          {/* Custom Labels (Binary) */}
          {formData.market_method === 'binary' && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="label_up" className="block text-sm font-medium mb-2">
                  Up/Yes Label <span className="text-destructive">*</span>
                </label>
                <input
                  id="label_up"
                  type="text"
                  value={formData.custom_labels.up}
                  onChange={(e) => handleChange('custom_labels', { ...formData.custom_labels, up: e.target.value })}
                  placeholder="UP, Yes, $5k, etc."
                  className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground"
                />
              </div>
              <div>
                <label htmlFor="label_down" className="block text-sm font-medium mb-2">
                  Down/No Label <span className="text-destructive">*</span>
                </label>
                <input
                  id="label_down"
                  type="text"
                  value={formData.custom_labels.down}
                  onChange={(e) => handleChange('custom_labels', { ...formData.custom_labels, down: e.target.value })}
                  placeholder="DOWN, No, $2.5k, etc."
                  className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground"
                />
              </div>
            </div>
          )}

          {/* Multi-Choice Options */}
          {formData.market_method === 'multi_choice' && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Options <span className="text-destructive">*</span>
              </label>
              <div className="space-y-2 mb-3">
                {formData.multi_choice_options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...formData.multi_choice_options]
                        newOptions[index] = e.target.value
                        handleChange('multi_choice_options', newOptions)
                      }}
                      className="flex-1 px-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-foreground"
                    />
                    <button
                      type="button"
                      onClick={() => removeMultiChoiceOption(index)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMultiChoiceOption}
                  onChange={(e) => setNewMultiChoiceOption(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMultiChoiceOption())}
                  placeholder="Add option..."
                  className="flex-1 px-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-foreground"
                />
                <button
                  type="button"
                  onClick={addMultiChoiceOption}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {errors.multi_choice && (
                <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.multi_choice}
                </p>
              )}
            </div>
          )}

          {/* Payment Options */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Payment Options <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-4">
              {['USDT', 'SOL'].map((option) => (
                <label key={option} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.payment_options.includes(option)}
                    onChange={() => handlePaymentOptionToggle(option)}
                    className="w-4 h-4"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors.payment && (
              <p className="mt-1 text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.payment}
              </p>
            )}
          </div>

          {/* Badge */}
          <div>
            <label htmlFor="badge" className="block text-sm font-medium mb-2">
              Badge (Optional)
            </label>
            <select
              id="badge"
              value={formData.badge}
              onChange={(e) => handleChange('badge', e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground"
            >
              <option value="">No badge</option>
              {BADGE_OPTIONS.map((badge) => (
                <option key={badge} value={badge}>
                  {badge}
                </option>
              ))}
            </select>
          </div>

          {/* Resolution Source */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="resolution_source_url" className="block text-sm font-medium mb-2">
                Resolution Source URL
              </label>
              <input
                id="resolution_source_url"
                type="url"
                value={formData.resolution_source_url}
                onChange={(e) => handleChange('resolution_source_url', e.target.value)}
                placeholder="https://www.binance.com/en/trade/ETH_USDT"
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                URL where the market will be resolved
              </p>
            </div>
            <div>
              <label htmlFor="resolution_source_name" className="block text-sm font-medium mb-2">
                Resolution Source Name
              </label>
              <input
                id="resolution_source_name"
                type="text"
                value={formData.resolution_source_name}
                onChange={(e) => handleChange('resolution_source_name', e.target.value)}
                placeholder="Binance, TradingView, etc."
                className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Display name for the source
              </p>
            </div>
          </div>

          {/* End Date */}
          {formData.market_type !== 'perpetual' && (
            <div>
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Market Image (Optional)</label>
            {imagePreview ? (
              <div className="space-y-3">
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border/50">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 bg-muted/20">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <span className="text-sm">Click to upload</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">Tags (Optional)</label>
            <input
              id="tags"
              type="text"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg text-foreground"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/markets')}
            className="px-6 py-3 border border-border/50 rounded-lg hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMarketMutation.isPending || uploadingImage || processingPayment}
            className="px-6 py-3 gold-button rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {processingPayment ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Processing payment...
              </>
            ) : uploadingImage ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Uploading...
              </>
            ) : createMarketMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Create Market {!isAdmin && `(${creationFee} SOL)`}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

