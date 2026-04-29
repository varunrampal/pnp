import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import plantsData from '../json/PlantsList.json';

const ADMIN_SESSION_KEY = 'pnp-admin-authenticated';
const ADMIN_PLANTS_API = '/api/admin/plants';
const DEFAULT_IMAGE = '/images/plants/thujaplicata.jpg';
const IMAGE_MAX_DIMENSION = 1200;
const IMAGE_QUALITY = 0.78;
const LIVE_ADMIN_SAVE_ERROR =
  'Admin save is not available on the live static site. Render Static Sites cannot write images or update PlantsList.json. Deploy this project as a Node Web Service with a real API, or make plant edits locally and redeploy.';

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'Green@35444';

const editableFields = [
  { name: 'Name', label: 'Plant Name', type: 'input' },
  { name: 'CommanName', label: 'Common Name', type: 'input' },
  { name: 'Type', label: 'Type', type: 'input' },
  { name: 'Imgpath', label: 'Image Path', type: 'input' },
  { name: 'Uses', label: 'Uses', type: 'textarea' },
  { name: 'MatureSize', label: 'Mature Size', type: 'textarea' },
  { name: 'SunMoisture', label: 'Sun/Moisture', type: 'textarea' },
  { name: 'RestorationValue', label: 'Restoration Value', type: 'textarea' },
  { name: 'Description', label: 'Description', type: 'textarea' },
];

const readSession = () => {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  } catch {
    return false;
  }
};

const imagePath = (path) => {
  if (!path || path.includes('default.jpg')) {
    return DEFAULT_IMAGE;
  }

  return path.replace(/^\.?\//, '/');
};

const plantImagePath = (slug, extension) => `./images/plants/${slug}.${extension}`;

const handleImageError = (event) => {
  if (event.currentTarget.src.endsWith(DEFAULT_IMAGE)) return;
  event.currentTarget.src = DEFAULT_IMAGE;
};

const safeText = (value) => String(value || '').toLowerCase();

const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  if (bytes < 1024) return `${bytes} B`;

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${kilobytes.toFixed(kilobytes >= 100 ? 0 : 1)} KB`;

  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(megabytes >= 10 ? 1 : 2)} MB`;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read image file.'));
    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Unable to load image file.'));
    image.src = src;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

const blobToDataUrl = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to prepare compressed image.'));
    reader.readAsDataURL(blob);
  });

const compressImageFile = async (file) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const largestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.min(1, IMAGE_MAX_DIMENSION / largestSide);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Image compression is not available in this browser.');
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  let extension = 'webp';
  let compressedBlob = await canvasToBlob(canvas, 'image/webp', IMAGE_QUALITY);

  if (!compressedBlob) {
    extension = 'jpg';
    compressedBlob = await canvasToBlob(canvas, 'image/jpeg', IMAGE_QUALITY);
  }

  if (!compressedBlob) {
    throw new Error('Unable to compress image.');
  }

  return {
    dataUrl: await blobToDataUrl(compressedBlob),
    extension,
    size: compressedBlob.size,
  };
};

const sortedPlants = (plants) =>
  [...plants].sort((a, b) => a.Name.localeCompare(b.Name));

const savePlantToFile = async (plant, imageData) => {
  const response = await fetch(`${ADMIN_PLANTS_API}/${encodeURIComponent(plant.slug)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      plant,
      imageData,
    }),
  });
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    throw new Error(LIVE_ADMIN_SAVE_ERROR);
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Unable to save plant changes.');
  }

  if (!result.plant?.slug) {
    throw new Error(LIVE_ADMIN_SAVE_ERROR);
  }

  return result.plant;
};

const PageHeader = ({ title, subtitle }) => (
  <div className="container-fluid page-header py-5 mb-5 wow fadeIn" data-wow-delay="0.1s">
    <div className="container text-center py-5">
      <h1 className="display-3 text-white mb-4 animated slideInDown">{title}</h1>
      {subtitle && <p className="text-white mb-0">{subtitle}</p>}
    </div>
  </div>
);

const LoginForm = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const updateCredential = (event) => {
    const { name, value } = event.target;
    setCredentials((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const didLogin = onLogin(credentials);

    if (!didLogin) {
      setError('Invalid username or password.');
    }
  };

  return (
    <>
      <PageHeader title="Admin Login" subtitle="Plant management" />
      <div className="container admin-login-wrap py-5">
        <form className="admin-login-panel" onSubmit={handleSubmit}>
          <h2>Admin Login</h2>
          <div className="mb-3">
            <label className="form-label" htmlFor="admin-username">
              Username
            </label>
            <input
              className="form-control"
              id="admin-username"
              name="username"
              onChange={updateCredential}
              type="text"
              value={credentials.username}
            />
          </div>
          <div className="mb-4">
            <label className="form-label" htmlFor="admin-password">
              Password
            </label>
            <input
              className="form-control"
              id="admin-password"
              name="password"
              onChange={updateCredential}
              type="password"
              value={credentials.password}
            />
          </div>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <button className="btn btn-primary w-100" type="submit">
            Login
          </button>
        </form>
      </div>
    </>
  );
};

const PlantManagement = ({ plants, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPlants = useMemo(() => {
    const query = safeText(searchTerm).trim();

    if (!query) return plants;

    return plants.filter((plant) =>
      [plant.Name, plant.CommanName, plant.Type, plant.id].some((value) =>
        safeText(value).includes(query),
      ),
    );
  }, [plants, searchTerm]);

  return (
    <>
      <PageHeader title="Admin" subtitle="Plant management" />
      <div className="container admin-page py-5">
        <div className="admin-toolbar">
          <div>
            <p className="admin-eyebrow">Plant Management</p>
            <h2>Plants</h2>
          </div>
          <button className="btn btn-outline-secondary" onClick={onLogout} type="button">
            Logout
          </button>
        </div>

        <div className="admin-search-panel mb-4">
          <div>
            <label className="form-label" htmlFor="admin-plant-search">
              Search Plants
            </label>
            <input
              className="form-control"
              id="admin-plant-search"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by plant or common name"
              type="search"
              value={searchTerm}
            />
          </div>
          <span className="admin-search-count">
            {filteredPlants.length} of {plants.length}
          </span>
        </div>

        <div className="admin-plant-list">
          <div className="admin-plant-list-head">
            <span>Image</span>
            <span>Plant Name</span>
            <span>Type</span>
            <span>Action</span>
          </div>

          {filteredPlants.map((plant) => (
            <div className="admin-plant-row" key={plant.slug}>
              <img
                alt={plant.Name}
                className="admin-plant-thumb"
                loading="lazy"
                onError={handleImageError}
                src={imagePath(plant.Imgpath)}
              />
              <div className="admin-plant-names">
                <Link className="admin-plant-name" to={`/plant/${plant.slug}`}>
                  {plant.Name}
                </Link>
                <span className="admin-plant-common">
                  {plant.CommanName || 'No common name'}
                </span>
              </div>
              <span className="admin-plant-type">{plant.Type || 'Uncategorized'}</span>
              <Link className="admin-edit-link" to={`/admin/plants/${plant.slug}/edit`}>
                Edit
              </Link>
            </div>
          ))}

          {!filteredPlants.length && (
            <div className="admin-empty-state">No plants found.</div>
          )}
        </div>
      </div>
    </>
  );
};

const missingPlantForm = () =>
  editableFields.reduce(
    (fields, field) => ({
      ...fields,
      [field.name]: '',
    }),
    {},
  );

const plantFormData = (plant) =>
  editableFields.reduce(
    (fields, field) => ({
      ...fields,
      [field.name]: plant[field.name] || '',
    }),
    missingPlantForm(),
  );

const PlantEdit = ({ onLogout, onSave, plant }) => {
  const [formData, setFormData] = useState(() => plantFormData(plant));
  const [pendingImage, setPendingImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ state: 'idle', message: '' });
  const previewImage = pendingImage?.dataUrl || imagePath(formData.Imgpath);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadStatus({ state: 'loading', message: 'Compressing image...' });

    try {
      const compressedImage = await compressImageFile(file);
      const nextImagePath = plantImagePath(plant.slug, compressedImage.extension);

      setPendingImage(compressedImage);
      setFormData((current) => ({ ...current, Imgpath: nextImagePath }));
      setUploadStatus({
        state: 'success',
        message: `Compressed ${formatBytes(file.size)} to ${formatBytes(
          compressedImage.size,
        )}. It will save as ${plant.slug}.${compressedImage.extension}.`,
      });
    } catch (error) {
      setUploadStatus({
        state: 'error',
        message: error.message || 'Unable to upload image.',
      });
    } finally {
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onSave({ ...plant, ...formData }, pendingImage?.dataUrl);
    } catch (error) {
      setUploadStatus({
        state: 'error',
        message: error.message || 'Unable to save plant changes.',
      });
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Edit Plant" subtitle={plant.Name} />
      <div className="container admin-page py-5">
        <div className="admin-toolbar">
          <Link className="btn btn-outline-secondary" to="/admin">
            Back to Plants
          </Link>
          <button className="btn btn-outline-secondary" onClick={onLogout} type="button">
            Logout
          </button>
        </div>

        <div className="admin-edit-layout">
          <aside className="admin-edit-preview">
            <img
              alt={formData.Name || plant.Name}
              onError={handleImageError}
              src={previewImage}
            />
            <h2>{formData.Name || plant.Name}</h2>
            <p>{formData.CommanName || 'No common name'}</p>
          </aside>

          <form className="admin-edit-form" onSubmit={handleSubmit}>
            <div className="admin-upload-field">
              <label className="form-label" htmlFor="plant-image-upload">
                Upload New Image
              </label>
              <input
                accept="image/*"
                className="form-control"
                id="plant-image-upload"
                onChange={handleImageUpload}
                type="file"
              />
              {uploadStatus.message && (
                <div className={`admin-upload-status ${uploadStatus.state}`}>
                  {uploadStatus.message}
                </div>
              )}
            </div>

            <div className="admin-form-grid">
              {editableFields.map((field) => (
                <div
                  className={`admin-form-field ${field.type === 'textarea' ? 'full' : ''}`}
                  key={field.name}
                >
                  <label className="form-label" htmlFor={`plant-${field.name}`}>
                    {field.label}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="form-control"
                      id={`plant-${field.name}`}
                      name={field.name}
                      onChange={updateField}
                      rows="3"
                      value={formData[field.name]}
                    />
                  ) : (
                    <input
                      className="form-control"
                      id={`plant-${field.name}`}
                      name={field.name}
                      onChange={updateField}
                      type="text"
                      value={formData[field.name]}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="admin-form-actions">
              <Link className="btn btn-outline-secondary" to="/admin">
                Cancel
              </Link>
              <button className="btn btn-primary" disabled={isSaving} type="submit">
                {isSaving ? 'Saving...' : 'Save Plant'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const AdminNotFound = ({ onLogout }) => (
  <>
    <PageHeader title="Plant Not Found" subtitle="Admin" />
    <div className="container admin-page py-5">
      <div className="admin-toolbar">
        <Link className="btn btn-outline-secondary" to="/admin">
          Back to Plants
        </Link>
        <button className="btn btn-outline-secondary" onClick={onLogout} type="button">
          Logout
        </button>
      </div>
      <div className="admin-empty-state">That plant is not available.</div>
    </div>
  </>
);

const Admin = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [isAuthenticated, setIsAuthenticated] = useState(readSession);
  const [plants, setPlants] = useState(() => sortedPlants(plantsData));

  const selectedPlant = useMemo(
    () => plants.find((plant) => plant.slug === slug),
    [plants, slug],
  );

  const handleLogin = ({ username, password }) => {
    const didLogin = username === ADMIN_USERNAME && password === ADMIN_PASSWORD;

    if (didLogin) {
      try {
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      } catch {
        // Keep login usable even if browser storage is blocked.
      }
      setIsAuthenticated(true);
    }

    return didLogin;
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    } catch {
      // Keep logout usable even if browser storage is blocked.
    }
    setIsAuthenticated(false);
    navigate('/admin');
  };

  const handleSave = async (updatedPlant, imageData) => {
    const savedPlant = await savePlantToFile(updatedPlant, imageData);

    setPlants((currentPlants) =>
      sortedPlants(
        currentPlants.map((plant) =>
          plant?.slug === savedPlant.slug ? savedPlant : plant,
        ),
      ),
    );
    navigate('/admin');
  };

  if (!isAuthenticated) {
    return <LoginForm onLogin={handleLogin} />;
  }

  if (slug && !selectedPlant) {
    return <AdminNotFound onLogout={handleLogout} />;
  }

  if (slug) {
    return (
      <PlantEdit onLogout={handleLogout} onSave={handleSave} plant={selectedPlant} />
    );
  }

  return <PlantManagement onLogout={handleLogout} plants={plants} />;
};

export default Admin;
