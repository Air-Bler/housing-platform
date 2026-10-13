import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { styles } from './estimator.styles';
import { IMAGE_LIMITS } from '../../api';

export default function ImageDropzone({ images, previews, onFilesAdded, onRemoveImage, notices = [] }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  return (
    <div style={styles.sectionBlock}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          ...styles.dropZone,
          ...(isDragging ? styles.dropZoneActive : {}),
        }}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={IMAGE_LIMITS.types.join(',')}
          onChange={(e) => {
            onFilesAdded(e.target.files);
            e.target.value = '';
          }}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-upload" style={styles.uploadLabel}>
          <div style={styles.uploadIconCircle}>
            <Upload size={20} color="#0F766E" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: '600', color: '#16212B' }}>
              Σύρε (Drag & Drop) εδώ τις φωτογραφίες σου
            </span>
            <span style={{ fontSize: '0.76rem', color: '#7A7264' }}>
              ή κάνε κλικ για να επιλέξεις αρχεία
            </span>
          </div>
        </label>
      </div>

      {previews.length > 0 && (
        <div style={styles.previewsGrid}>
          {previews.map((src, index) => (
            <div key={index} style={styles.previewThumbWrapper}>
              <img src={src} alt={`upload-${index}`} style={styles.previewThumb} />
              <button
                type="button"
                onClick={() => onRemoveImage(index)}
                style={styles.removeBtn}
                title="Αφαίρεση φωτογραφίας"
              >
                <X size={12} color="#FFFFFF" />
              </button>
            </div>
          ))}
        </div>
      )}

      {notices.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: '1.1rem', fontSize: '0.76rem', color: '#8A3226' }}>
          {notices.map((n, i) => <li key={i}>{n}</li>)}
        </ul>
      )}

      <span style={{ fontSize: '0.74rem', color: '#7A7264' }}>
        Έως {IMAGE_LIMITS.maxImages} φωτογραφίες JPEG, PNG ή WEBP, μέχρι {IMAGE_LIMITS.maxImageBytes / 1024 / 1024} MB η καθεμία.{' '}
        Προαιρετικό: Το AI θα αναλύσει οπτικά τους χώρους και τις ανάγκες ανακαίνισης.
      </span>
    </div>
  );
}