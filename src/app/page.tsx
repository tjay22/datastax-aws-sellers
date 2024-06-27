'use client'

import Image from "next/image";
import { testData, similarImages } from "@/data/test-data";
import { useEffect, useState, useRef } from "react";

interface Item {
  _id: string;
  description: string;
  email: string;
  s3_url: string;
  vsearch_results: [];
  start_dwnld: Date;
  end_dwnld: Date;
  start_s3_store: Date;
  end_s3_store: Date;
  start_astra_store: Date;
  end_astra_store: Date;
  start_get_desc: Date;
  end_get_desc: Date;
  start_embedding: Date;
  end_embedding: Date;
  start_vsearch: Date;
  end_vsearch: Date;
}

interface Image {
  _id: string;
  brand: string;
  file_path: string;
  product_name: string;
  similarity: number;
  vsearch_results: any[]; // Add the vsearch_results property
}

export default function Home() {

  const [items, setItems] = useState<Item[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<number>(0);
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const numItems = useRef<number>(0);
  
  const duration_dwnld = useRef<number>(0);
  const duration_s3_store = useRef<number>(0);
  const duration_astra_store = useRef<number>(0);
  const duration_get_desc = useRef<number>(0);
  const duration_embedding = useRef<number>(0);
  const duration_vsearch = useRef<number>(0);

  const getImages = async () => {
    if (isRunning) {
      setIsRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    try {
      const response = await fetch("api/images", {
        cache: "no-store",
      });
      const data = await response.json();
      setLoading(false);
      setItems(data.data);
      return data;
    } catch (error) {
      setError('Failed to fetch images');
      setLoading(false);
    }
  };

  const fetchData = () => {
    getImages().then((data) => {
      setImages(data.data[currentItem].vsearch_results);
      setCurrentItem(0);
    });
    handleDurationCalculation();
    startTimer();
  };

  useEffect(() => {
    fetchData();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    numItems.current = items.length;
    //console.log(items[currentItem]?.start_dwnld);
    handleDurationCalculation();
  }, [items]);

  useEffect(() => {
    setImages(items[currentItem]?.vsearch_results || []); 
    handleDurationCalculation();
  }, [currentItem]);

  const calculateDuration = (start: Date, end: Date) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return (endTime - startTime);
  };

  const handleDurationCalculation = () => {
    duration_dwnld.current = calculateDuration(items[currentItem]?.start_dwnld, items[currentItem]?.end_dwnld);

    duration_s3_store.current = calculateDuration(items[currentItem]?.start_s3_store, items[currentItem]?.end_s3_store);

    duration_astra_store.current = calculateDuration(items[currentItem]?.start_astra_store, items[currentItem]?.end_astra_store);

    duration_get_desc.current = calculateDuration(items[currentItem]?.start_get_desc, items[currentItem]?.end_get_desc);

    duration_embedding.current = calculateDuration(items[currentItem]?.start_embedding, items[currentItem]?.end_embedding);

    duration_vsearch.current = calculateDuration(items[currentItem]?.start_vsearch, items[currentItem]?.end_vsearch);
  };

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setCurrentItem((prevItemNum) => {
          const newItemNum = prevItemNum + 1;
          if (newItemNum >= numItems.current) {
            window.location.reload();
            return 0; // Reset the counter
          }
          return newItemNum;
        });
      }, 5000);
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentItem(0);
    fetchData();
  };

  if (loading) {
    return (
      <main className="container mx-auto p-10 min-h-screen flex items-center justify-center">
        <div>Fetching latest items...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto p-10 min-h-screen flex items-center justify-center">
        <div>{error}</div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-10">
      <section className="flex flex-col gap-10">
        <div className="items-start justify-center flex gap-10 overflow-hidden">
          <div className="w-1/4 aspect-square flex-shrink-0">
            <Image src={items[currentItem].s3_url} alt={items[currentItem].description} width={500} height={500} className="bg-white relative object-cover h-full w-full rotate-90" />
          </div>
          <div>
            <p className="description">{items[currentItem].description}</p>
          </div>
        </div>
        <div className="bg-opacity-20 bg-slate-400 dark:bg-slate-800 p-5 items-center justify-center">
          <ul className="flex flex-row gap-5 justify-center">
            {images.map((image) => (
              <li key={image._id}>
                <Image src={image.file_path} alt={image.brand} width={100} height={100} className="bg-white object-cover" />
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-row items-stretch gap-5">
          <div className="workflow-card">
            <div>
              <p className="title">Process Image</p>
              <p>EC2 to read image from Email, S3 to store image, Privatelink to connect to S3</p>
            </div>
            <div><span>Duration:</span>{duration_s3_store.current} ms</div>
          </div>
          <div className="workflow-card">
            <div>
              <p className="title">Store in Astra</p>
              <p>Store image in Astra</p>
            </div>
            <div><span>Duration:</span>{duration_astra_store.current} ms</div>
          </div>
          <div className="workflow-card">
            <div>
              <p className="title">Get Description</p>
              <p>Get text description of image</p>
            </div>
            <div><span>Duration:</span>{duration_get_desc.current} ms</div>
          </div>
          <div className="workflow-card">
            <div>
              <p className="title">Generate Embedding</p>
              <p>use Bedrock to generate embedding from image and description</p>
            </div>
            <div><span>Duration:</span>{duration_embedding.current} ms</div>
          </div>
          <div className="workflow-card">
            <div>
              <p className="title">Vector Search</p>
              <p>Search for similar images in Astra</p>
            </div>
            <div><span>Duration:</span>{duration_vsearch.current} ms</div>
          </div>
          <div className="workflow-card">
            <div>
              <p className="title">Download</p>
              <p>Return results of similar items</p>
            </div>
            <div><span>Duration:</span>{duration_dwnld.current} ms</div>
          </div>
        </div>
      </section>
    </main>
  );
}
