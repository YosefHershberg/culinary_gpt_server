
type BaseUser = {
    first_name: string;
    last_name: string;
    clerkId: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
};

type SubscribedUser = BaseUser & {
    isSubscribed: true;
    stripeCustomerId: string;
    stripeSubscriptionId: string;
};

type NonSubscribedUser = BaseUser & {
    isSubscribed: false;
    stripeCustomerId?: null;
    stripeSubscriptionId?: null;
};

export type User = SubscribedUser | NonSubscribedUser;
