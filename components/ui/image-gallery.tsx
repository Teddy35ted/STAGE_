// Composant pour afficher les galeries d'images
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiMaximize2, FiX } from 'react-icons/fi';
import { UniversalMedia } from '../media/UniversalMedia';

interface ImageGalleryProps {
  images: string[];
  title?: string;
  className?: string;
}

export function ImageGallery({ images, title, className = "" }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  if (!images || images.length === 0) return null;

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const openLightbox = () => {
    setShowLightbox(true);
  };

  const closeLightbox = () => {
    setShowLightbox(false);
  };

  // Une seule image - affichage simple
  if (images.length === 1) {
    return (
      <div className={className}>
        <div 
          className="relative cursor-pointer group"
          onClick={openLightbox}
        >
          <UniversalMedia 
            src={images[0]} 
            alt={title || 'Image'} 
            className="w-full h-48 object-cover rounded-lg" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <FiMaximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Lightbox pour image unique */}
        {showLightbox && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={closeLightbox}>
            <div className="relative max-w-4xl max-h-4xl p-4">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 z-10"
              >
                <FiX className="w-6 h-6" />
              </button>
              <UniversalMedia 
                src={images[0]} 
                alt={title || 'Image'} 
                className="max-w-full max-h-full object-contain" 
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Plusieurs images - galerie avec navigation
  return (
    <div className={className}>
      {/* Image principale */}
      <div className="relative">
        <div 
          className="relative cursor-pointer group"
          onClick={openLightbox}
        >
          <UniversalMedia 
            src={images[currentIndex]} 
            alt={`${title || 'Image'} ${currentIndex + 1}`} 
            className="w-full h-48 object-cover rounded-lg" 
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
            <FiMaximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Boutons de navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>

            {/* Indicateur du nombre d'images */}
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Miniatures */}
      {images.length > 1 && (
        <div className="flex space-x-2 mt-3 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <UniversalMedia 
                src={image} 
                alt={`Miniature ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox pour galerie */}
      {showLightbox && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative max-w-6xl max-h-6xl p-4 w-full h-full flex items-center justify-center">
            {/* Bouton fermer */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 z-10"
            >
              <FiX className="w-6 h-6" />
            </button>

            {/* Navigation lightbox */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 z-10"
                >
                  <FiChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-3 hover:bg-opacity-70 z-10"
                >
                  <FiChevronRight className="w-6 h-6" />
                </button>

                {/* Compteur lightbox */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Image principale lightbox */}
            <UniversalMedia 
              src={images[currentIndex]} 
              alt={`${title || 'Image'} ${currentIndex + 1}`} 
              className="max-w-full max-h-full object-contain" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
