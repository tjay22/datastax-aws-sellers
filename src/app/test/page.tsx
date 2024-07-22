'use client'

import Image from "next/image";
import { useEffect, useState, useRef, useMemo } from "react";
import { useAnimate, stagger, motion, animate, useAnimationControls, AnimatePresence, delay } from "framer-motion";

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

interface SimilarImage {
  _id: string;
  brand: string;
  file_path: string;
  product_name: string;
  similarity: number;
  vsearch_results: any[]; // Add the vsearch_results property
}

export default function Home() {

  const controls = useAnimationControls();
  const showTextControls = useAnimationControls();
  const [scope, animate] = useAnimate();

  const [items, setItems] = useState<Item[]>([]);
  const [images, setImages] = useState<SimilarImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<number>(0);
  const [timerStarted, setTimerStarted] = useState<boolean>(false);
  const [isNewData, setIsNewData] = useState<boolean>(false);
  
  const [isRunningSlideshow, setIsRunningSlideshow] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const slideshowInterval = useRef<number>(10000);
  const numItems = useRef<number>(0);
  const prevItems = useRef<Item[]>([]);

  const [isRunningFetchData, setIsRunningFetchData] = useState<boolean>(false);
  const timerRefFetchData = useRef<NodeJS.Timeout | null>(null);
  const fetchInterval = useRef<number>(10000);
  
  const duration_dwnld = useRef<number | undefined>(0);
  const duration_s3_store = useRef<number | undefined>(0);
  const duration_astra_store = useRef<number | undefined>(0);
  const duration_get_desc = useRef<number | undefined>(0);
  const duration_embedding = useRef<number | undefined>(0);
  const duration_vsearch = useRef<number | undefined>(0);

  const getData = async () => {
    // if (isRunningSlideshow) {
    //   setIsRunningSlideshow(false);
    //   if (timerRef.current) {
    //     clearInterval(timerRef.current);
    //   }
    // }
    try {
      const response = await fetch("api/test", {
        cache: "no-store",
      });
      const data = await response.json();
      //setItems(data.data);
      return data;
    } catch (error) {
      setError('Failed to fetch images');
      setLoading(false);
    }
  };

  const fetchData = () => {
    //console.log("items Array in fetchData: ", items);
    getData().then((data) => {
      let reversedData = data.reverse();
      updateItemsState(reversedData);
      //setImages(data.data[currentItem].vsearch_results);
      setLoading(false);
    });
    //controls.start("initial");
    //controls.start("animate");
  };

  const partialEmail = (email: string) => {
    return email.replace(/(.{2})(.*)(?=@)/, (a, b, c) => b + c.replace(/./g, "*"));
  }

  const dataIsEqual = (arr1: Item[], arr2: Item[]): boolean => {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i]._id !== arr2[i]._id) return false;
    }
    return true;
  };

  const updateItemsState = (newItems: Item[]) => {
    //console.log("Array 1: ", prevItems.current, "Array 2: ", newItems);
    if (!dataIsEqual(prevItems.current, newItems)) {
      //console.log("Items are different!");
      setItems(newItems);
      setCurrentItem(0);
      prevItems.current = newItems;
      showTextControls.start("animate");
      //resetSlideshowTimer();
    } else {
      //console.log("Items are the same!");
    }
  };

  useEffect(() => {
    fetchData();
    console.log("First useEffect...");
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (timerRefFetchData.current) {
        clearInterval(timerRefFetchData.current);
      }
    };
  }, []);

  // useEffect(() => {
  //   console.log("IMAGES: ", images);
  // },[images]);

  // useEffect(() => {
  //   console.log("ID ARRAY: ", ids);
  // },[ids]);

  useEffect(() => {
    numItems.current = items.length;
    setImages(items[currentItem]?.vsearch_results || []);
    handleDurationCalculation();
    console.log("items useEffect...");

  }, [items]);

  useEffect(() => {
    setImages(items[currentItem]?.vsearch_results || []); 
    handleDurationCalculation();
    console.log("currentItem: ", currentItem);
  }, [currentItem]);

  const calculateDuration = (start: Date, end: Date) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = endTime - startTime;
    return !isNaN(duration) ? duration : 0;
  };

  const handleDurationCalculation = () => {

    if(!items[currentItem]) return;

    //setCurrentItem(currentItem);
    if (!timerStarted) {
      startDataFetchTimer();
      startSlideshowTimer();
      setTimerStarted(true);
    }


    duration_dwnld.current = calculateDuration(items[currentItem]?.start_dwnld, items[currentItem]?.end_dwnld);
    duration_s3_store.current = calculateDuration(items[currentItem]?.start_s3_store, items[currentItem]?.end_s3_store);
    duration_astra_store.current = calculateDuration(items[currentItem]?.start_astra_store, items[currentItem]?.end_astra_store);
    duration_get_desc.current = calculateDuration(items[currentItem]?.start_get_desc, items[currentItem]?.end_get_desc);
    duration_embedding.current = calculateDuration(items[currentItem]?.start_embedding, items[currentItem]?.end_embedding);
    duration_vsearch.current = calculateDuration(items[currentItem]?.start_vsearch, items[currentItem]?.end_vsearch);

  };

  const startDataFetchTimer = () => {
    if (!isRunningFetchData) {
      console.log("Starting data fetch timer...");
      setIsRunningFetchData(true);
      timerRefFetchData.current = setInterval(() => {
        fetchData();
      }, fetchInterval.current);
    }
  };

  const startSlideshowTimer = () => {
    if (!isRunningSlideshow) {
      console.log("Starting slideshow timer...");
      controls.set("initial");
      controls.start("animate");
      setIsRunningSlideshow(true);
      setTimerStarted(true);
      timerRef.current = setInterval(() => {
        setCurrentItem((prevItemNum) => {
          const newItemNum = prevItemNum + 1;
          if (newItemNum >= numItems.current) {
            //window.location.reload();
            return 0; // Reset the counter
          }
          return newItemNum;
        });
      }, slideshowInterval.current);
    }
  };

  const resetSlideshowTimer = () => {
    setTimerStarted(false);
    setIsRunningSlideshow(false);
    console.log("Resetting slideshow timer...");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      startSlideshowTimer();
      setCurrentItem(0);
    }
  };

  const resetDataFetchTimer = () => {
    setIsRunningFetchData(false);
    console.log("Resetting data fetch timer...");
    if (timerRefFetchData.current) {
      clearInterval(timerRefFetchData.current);
      startDataFetchTimer();
    }
  };

  const processAnimationCard = {
    initial: { 
      opacity: 0, 
      x: -100
    },
    animate: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        easeInOut: 0.5,
        delay: 0.5 * index
      }
    })
  }

  const processAnimationArrow = {
    initial: { 
      opacity: 0, 
      x: -100
    },
    animate: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        easeInOut: 0.5,
        delay: 0.55 * index
      }
    })
  }

  const slideIndicatorSequence = () => {
    if(scope.current === null) return;
    //console.log("SCOPE: ", scope.current);
    animate(
      "#slide-indicator1",
      {
        transform: ["translateX(-100%)", "translateX(0%)", "translateX(100%)"]
      },
      {
        duration: (slideshowInterval.current / 1000)*2,
        repeatDelay: slideshowInterval.current / 1000,
        repeat: Infinity,
        repeatType: "loop"
      }
    );
    animate(
      "#slide-indicator2",
      {
        transform: ["translateX(-100%)", "translateX(0%)", "translateX(100%)"],
      },
      {
        duration: (slideshowInterval.current / 1000)*2,
        delay: slideshowInterval.current / 1000,
        repeat: Infinity,
        repeatType: "loop"
      }
    );
    
  }
  //slideIndicatorSequence();

  // const slideIndicatorSequence2 = [
  //   ["#slide-indicator1", { x: [-100, 0, 100] }, { duration: slideshowInterval.current / 1000, repeat: Infinity }],
  //   ["#slide-indicator2", { x: [-100, 0, 100] }, { duration: slideshowInterval.current / 1000, repeat: Infinity, delay: slideshowInterval.current / 1000}]
  // ];
  // animate(slideIndicatorSequence2);

  const slideIndicator = {
    initial: { 
      x: "-100%"
    },
    animate: {
      x: ["-100%", "0%", "100%"],
      transition: {
        duration: (slideshowInterval.current / 1000)*2,
        repeat: Infinity,
      }
    },
    exit: {
      x: "100%",
      transition: {
        duration: slideshowInterval.current / 1000
      }
    }
  }
  const slideIndicator2 = {
    initial: { 
      x: "-100%" 
    },
    animate: {
      x: ["-100%", "0%", "100%"],
      transition: {
        duration: (slideshowInterval.current / 1000)*2,
        delay: slideshowInterval.current / 1000,
        repeat: Infinity,
      }
    },
    exit: {
      x: "100%",
      transition: {
        duration: slideshowInterval.current / 1000
      }
    }
  }
  const newDataTextAnimation = {
    initial: {
      opacity: 0
    },
    animate: {
      opacity: [0, 1, 1, 0],
      y: [0, -10, -10, 0],
      transition: {
        duration: 5,
        times: [0, 0.1, 0.9, 1],
      }
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5
      }
    }
  }

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
    <main className="w-full h-screen overflow-hidden px-5">
      <div ref={scope}>
        <motion.div
          key={0}
          id="slide-indicator1" 
          variants={slideIndicator}
          animate={controls}
          initial="initial"
          exit = "exit"
          className="w-full fixed bottom-0 h-2 bg-[#7AA116]"
        >
        </motion.div>
        <motion.div
          key={1}
          id="slide-indicator2"
          variants={slideIndicator2}
          animate={controls}
          initial="initial"
          exit = "exit"
          className="w-full fixed bottom-0 h-2 bg-[#ED7101]"
        >
        </motion.div>
        <motion.div
          key={2}
          id="text-indicator"
          variants={newDataTextAnimation}
          initial="initial"
          animate={showTextControls}
          exit="exit"
          className="w-auto absolute bottom-0 bg-[#00A88D] text-white text-center py-2 px-4 rounded-sm shadow-lg my-10 mx-5 z-10"
        >
          New entry from {partialEmail(items[currentItem].email)}
        </motion.div>
      </div>
      <AnimatePresence>
        <motion.section 
          key={currentItem} 
          className="container h-screen mx-auto flex flex-col gap-10 py-10 overflow-hidden"
          initial={{ y: "-100%", opacity: 0}}
          animate={{ y: 0, opacity: 1}}
          exit={{ y: "100%", opacity: 0}}
          transition={{ duration: 0.5, ease: "easeInOut", type: "tween"}}
        >
          <div className="items-start justify-center flex gap-10 overflow-hidden">
            <motion.div
              className="w-1/4 aspect-square flex-shrink-0"
              variants={processAnimationCard}
              initial="initial"
              whileInView="animate"
              custom={0}
            >
              
            </motion.div>
            <div>
              <motion.p 
                className="description"
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={2}
              >
                <p>ID: {items[currentItem]._id}</p>
                <p>Description: {items[currentItem].description}</p>
                <p>Email: {partialEmail(items[currentItem].email)}</p>
              </motion.p>
              <motion.div
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={5}
              >
              </motion.div>
            </div>
          </div>
          
          <div className="flex flex-row gap-5 justify-center">
            <ul className="steps">
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={0}
              >
                <div className="title"><span className="step-counter"></span>Process Image</div>
                <div className="icons">
                  <Image src="Arch_Amazon-EC2_64.svg" alt="EC2" width={50} height={50} />
                  <Image src="Arch-Category_Storage_64.svg" alt="S3" width={50} height={50} />
                </div>
                <p>EC2 to read image from Email, S3 to store image, Privatelink to connect to S3</p>
                <div className="duration"><span>Duration:</span>{duration_s3_store.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={0}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={1}
              >
                <div className="title"><span className="step-counter"></span>Store in Astra</div>
                <div className="icons">
                  <Image 
                    src="astra_logo.jpg" 
                    alt="Astra" 
                    width={0} 
                    height={0} 
                    style={{ width: "120px", height: "auto" }}
                  />
                </div>
                <p>Images are stored in Astra</p>
                <div className="duration"><span>Duration:</span>{duration_astra_store.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={1}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={2}
              >
                <div className="title"><span className="step-counter"></span>Generate Description</div>
                <div className="icons">
                  <Image 
                    src="Arch_Amazon-Bedrock_64.svg" 
                    alt="Bedrock" 
                    width={0} 
                    height={0} 
                    style={{ width: "50px", height: "auto"  }}
                  />
                  <Image 
                    src="claude3.jpg" 
                    alt="Claude 3 Sonnet" 
                    width={0} 
                    height={0} 
                    style={{ width: "120px", height: "auto"  }} 
                  />
                </div>
                <p>Image description generated by Claude 3 Sonnet</p>
                <div className="duration"><span>Duration:</span>{duration_get_desc.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={2}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={3}
              >
                <div className="title"><span className="step-counter"></span>Generate Embedding</div>
                <div className="icons">
                  <Image 
                    src="Arch_Amazon-Bedrock_64.svg" 
                    alt="Bedrock" 
                    width={0} 
                    height={0} 
                    style={{ width: "50px", height: "auto" }}
                  />
                </div>
                <p>Bedrock to generate embedding from image and description</p>
                <div className="duration"><span>Duration:</span>{duration_embedding.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={3}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={4}
              >
                <div className="title"><span className="step-counter"></span>Vector Search</div>
                <div className="icons">
                  <Image 
                    src="astra_logo.jpg" 
                    alt="Astra" 
                    width={0} 
                    height={0}
                    style={{ width: "120px", height: "auto" }} 
                  />
                </div>
                <p>Search for similar images in Astra</p>
                <div className="duration"><span>Duration:</span>{duration_vsearch.current} ms</div>
                <motion.div 
                  className="arrow"
                  variants={processAnimationArrow}
                  initial="initial"
                  whileInView="animate"
                  custom={4}
                ></motion.div>
              </motion.li>
              <motion.li 
                className="step" 
                variants={processAnimationCard}
                initial="initial"
                whileInView="animate"
                custom={5}
              >
                <div className="title"><span className="step-counter"></span>Display Results</div>
                <div className="icons">
                  <Image 
                    src="Nextjs-logo.svg" 
                    alt="NextJS" 
                    width={0} 
                    height={0} 
                    style={{ width: "150px", height: "auto", fill: "white"}}
                  />
                </div>
                <p>Results are displayed on the dashboard</p>
                <div className="duration"><span>Duration:</span>{duration_dwnld.current} ms</div>
              </motion.li>
            </ul>
          </div>
        </motion.section>
      </AnimatePresence>
    </main>
  );
}
