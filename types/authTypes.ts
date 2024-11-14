export type VideoPurchase = {
  id: number;
  userId: number;
  videoId: number;
};

export type TUser = {
  id: number;
  email: string;
  password: string;
  role: string;
  emailVerified: boolean;
  subscribed: boolean;
  stripeCustomerId: string | null;
  videoPurchase: VideoPurchase[];
};
