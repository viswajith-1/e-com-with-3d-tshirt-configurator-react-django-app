import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const CollapsibleSection = ({ title, children, isPro = false, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-300">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-3 text-gray-700 hover:bg-gray-100 px-2 rounded-md">
        <span className="font-semibold">{title}</span>
        <div className="flex items-center space-x-2">
            {isPro && <span className="text-xs font-bold text-purple-500 bg-purple-100 px-2 py-0.5 rounded-full">Pro</span>}
            <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>
      {isOpen && <div className="p-4 bg-gray-50 space-y-4">{children}</div>}
    </div>
  );
};

export default function App() {
  const mountRef = useRef(null);
  const navigate = useNavigate();
  const [color, setColor] = useState('#000000');
  const [text, setText] = useState('NEXUS');
  const [textColor, setTextColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [textSize, setTextSize] = useState(50);
  const [textPosition] = useState({ x: 300, y: 575 });
  const [isProcessing, setIsProcessing] = useState(false);

  const modelRef = useRef();
  const canvasRef = useRef();
  const textureRef = useRef();
  const rendererRef = useRef(); // Ref to hold the renderer instance

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
    camera.position.z = 3.3;
    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    rendererRef.current = renderer; // Store renderer in ref
    currentMount.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    canvasRef.current = canvas;
    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = true;
    textureRef.current = texture;

    const loader = new GLTFLoader();
    loader.load(
      '/oversized_t-shirt.glb',
      (gltf) => {
        if (modelRef.current) scene.remove(modelRef.current);
        const loadedModel = gltf.scene;
        loadedModel.traverse((child) => {
          if (child.isMesh) {
            child.material = new THREE.MeshStandardMaterial({ map: textureRef.current, metalness: 0.1, roughness: 0.8 });
            child.material.map.needsUpdate = true;
          }
        });
        const box = new THREE.Box3().setFromObject(loadedModel);
        const center = box.getCenter(new THREE.Vector3());
        loadedModel.position.sub(center);
        loadedModel.position.y -= 3.7;
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.0 / maxDim;
        loadedModel.scale.multiplyScalar(scale);
        scene.add(loadedModel);
        modelRef.current = loadedModel;
      },
      undefined,
      (error) => console.error('An error happened while loading the model:', error)
    );

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (currentMount) {
        camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (canvasRef.current && textureRef.current) {
      const context = canvasRef.current.getContext('2d');
      const { width, height } = canvasRef.current;
      context.fillStyle = color;
      context.fillRect(0, 0, width, height);
      if (backgroundImage) context.drawImage(backgroundImage, 0, 0, width, height);
      if (text) {
          context.font = `bold ${textSize}px sans-serif`;
          context.fillStyle = textColor;
          context.textAlign = 'center';
          context.textBaseline = 'middle';
          context.fillText(text, textPosition.x, textPosition.y);
      }
      textureRef.current.needsUpdate = true;
      if (modelRef.current) {
         modelRef.current.traverse((child) => {
            if (child.isMesh && child.material.map) child.material.map.needsUpdate = true;
          });
      }
    }
  }, [text, color, textColor, backgroundImage, textPosition, textSize]);

  const loadImage = (file, setImage) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };
  
  const handleExportAndOrder = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem('access_token');
    if (!token) {
        navigate('/auth');
        return;
    }
    
    // --- THIS IS THE MODIFIED LINE ---
    // Capture the 3D view canvas, not the 2D texture canvas
    rendererRef.current.domElement.toBlob(async (blob) => {
        if (!blob) {
            alert("Error: Could not capture the T-shirt snapshot. Please try again.");
            setIsProcessing(false);
            return;
        }
        const formData = new FormData();
        formData.append('name', `Custom NEXUS T-Shirt - ${Date.now()}`);
        formData.append('description', `Custom design with color: ${color} and text: "${text}".`);
        formData.append('price', '1000');
        formData.append('stock', '1');
        formData.append('image', blob, 'custom_snapshot.png'); // Upload the snapshot
        formData.append('is_custom', 'true');
        try {
            const response = await fetch('http://127.0.0.1:8000/api/products/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (response.ok) {
                const newProduct = await response.json();
                const MOCK_CART_KEY = 'mockCart';
                const storedCart = JSON.parse(localStorage.getItem(MOCK_CART_KEY) || '[]');
                const newCartItem = {
                    id: newProduct.id, name: newProduct.name, price: newProduct.price,
                    image: newProduct.image, quantity: 1, size: 'M', color: 'Custom',
                };
                storedCart.push(newCartItem);
                localStorage.setItem(MOCK_CART_KEY, JSON.stringify(storedCart));
                navigate('/cart');
            } else if (response.status === 43) {
                 alert("Permission Denied: Your account cannot create products. Please log in as an admin or contact support.");
            } else {
                const errorData = await response.json();
                alert(`An error occurred: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Error creating custom product:", error);
            alert("A network error occurred. Please check your connection and try again.");
        } finally {
            setIsProcessing(false);
        }
    }, 'image/png');
  };

  const handleDownloadSnapshot = () => {
    if (!rendererRef.current) {
        console.error("Renderer not available.");
        return;
    }
    const dataURL = rendererRef.current.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `nexus-tshirt-snapshot-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex w-screen h-screen bg-white font-sans text-gray-800">
      <div className="w-80 p-4 pt-8 overflow-y-auto bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="flex-grow space-y-2">
            <CollapsibleSection title="T-Shirt Color" defaultOpen={true}>
                 <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Color</span>
                    <input type="color" value={color} onChange={(e) => {
                        setColor(e.target.value);
                        setBackgroundImage(null);
                    }} className="w-10 h-10 p-0 border-none rounded-md cursor-pointer"/>
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Text Customization" defaultOpen={true}>
                <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700">Text</label>
                    <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="p-1 rounded-md bg-gray-200 border border-gray-300 w-28"/>
                </div>
                <div className="flex items-center justify-between">
                    <label className="font-medium text-gray-700">Color</label>
                    <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-10 h-10 p-0 border-none rounded-md cursor-pointer"/>
                </div>
                <div>
                    <label className="font-medium text-gray-700">Size: {textSize}px</label>
                    <input type="range" min="16" max="128" value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} className="w-full accent-blue-500"/>
                </div>
            </CollapsibleSection>
            <CollapsibleSection title="Background Image" defaultOpen={true}>
                 <div>
                    <label className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-md cursor-pointer text-center block text-sm">
                        Upload Picture
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => loadImage(e.target.files[0], setBackgroundImage)}/>
                    </label>
                </div>
            </CollapsibleSection>
        </div>

        <div className="pt-4 border-t border-gray-200 space-y-2">
            <button
                onClick={handleExportAndOrder}
                disabled={isProcessing}
                className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                {isProcessing ? 'Processing...' : 'Export and Order'}
            </button>
            <button
                onClick={handleDownloadSnapshot}
                className="w-full bg-gray-600 text-white py-3 rounded-full font-semibold hover:bg-gray-700 transition-colors duration-300"
            >
                Download Snapshot
            </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 relative">
            <div ref={mountRef} className="w-full h-full"></div>
        </div>
      </div>
    </div>
  );
}