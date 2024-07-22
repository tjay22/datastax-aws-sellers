export interface Icon {
  src: string;
  alt: string;
}

export interface StepIcon {
  icon: string;
  width: number;
  style: string;
}

export interface Step {
  id: number;
  title: string;
  description: string;
  icons: StepIcon[];
  duration_start_var: string;
  duration_end_var: string;
}

export interface Config {
  title: string;
  description: string;
  apiURL: string;
  slideshowInterval: number;
  slideshowTransitionDuration: number;
  cardAnimationDuration: number;
  cardStaggerDelay: number;
  messages: {
    imagesFetching: string;
    imagesLoadError: string;
  };
  icons: {
    [key: string]: any;
    astra: Icon;
    bedrock: Icon;
    claude3: Icon;
    ec2: Icon;
    nextjs: Icon;
    s3: Icon;
  };
  steps: Step[];
}

export interface Item {
  [key: string]: any;
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

export interface SimilarImage {
  _id: string;
  brand: string;
  file_path: string;
  product_name: string;
  similarity: number;
  vsearch_results: any[]; // Add the vsearch_results property
}

export interface StepCardType {
  id: number;
  items: Item[];
  currentItem: number;
  durationStartVar: string;
  durationEndVar: string;
  processAnimationCard: {};
  processAnimationArrow: {};
  title: string;
  description: string;
  icons: StepIcon[];
}