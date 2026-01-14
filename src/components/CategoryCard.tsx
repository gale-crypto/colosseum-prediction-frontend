import { Link } from 'react-router-dom'

interface CategoryCardProps {
  name: string
  slug: string
  image?: string
  gradient: string
  isActive?: boolean
}

export default function CategoryCard({ name, slug, image, gradient, isActive = false }: CategoryCardProps) {
  return (
    <Link
      to={`/markets?category=${slug}`}
      className={`category-card relative group flex-shrink-0 w-[calc(19%-9.6px)] 2xl:w-full rounded-2xl overflow-hidden cursor-pointer transition-transform hover:scale-105 flex flex-col items-center ${
        isActive ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="py-2 px-3 xl:px-4 w-full">
        <h3 
        className="text-xs sm:text-sm lg:text-base font-medium sm:-tracking-[0.015em] text-left truncate" 
        // style={{color: "rgb(50, 7, 8)"}}
        >
          {name}
        </h3>
      </div>

      <img 
      src={`/images/categories/crypto.webp`}
      alt={name}
      className="w-full h-[132px] md:h-[152px] xl:h-[180px] rounded-2xl object-cover bg-bg-weak-50"
      />      

      {/* Background Image or Gradient */}
      {image ? (
        <img
          src={image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 ${gradient}`} />
      )}

    </Link>
  )
}

