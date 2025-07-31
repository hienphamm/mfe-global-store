import {BehaviorSubject, Subject} from 'rxjs';
import {filter, map} from 'rxjs/operators';

const userState$ = new BehaviorSubject({
    user: null,
    isAuthenticated: false
});

const cartState$ = new BehaviorSubject({
    cart: [],
});

const notificationState$ = new BehaviorSubject({
    notifications: [],
    unreadCount: 0
});

const eventBus$ = new Subject();

const addToCart = (item) => {
    const currentState = cartState$.value;
    const newCart = [...currentState.cart, item];

    cartState$.next({
        cart: newCart
    });

    window.dispatchEvent(new CustomEvent('add-to-cart', {
        detail: {cart: newCart}
    }));
}

const removeFromCart = (itemId) => {
    const currentState = cartState$.value;
    const newCart = currentState.cart.filter(item => item.id !== itemId);

    cartState$.next({
        cart: newCart
    });

    window.dispatchEvent(new CustomEvent('remove-from-cart', {
        detail: {cart: newCart}
    }));
}

const updateUser = (user) => {
    const currentState = userState$.value;
    userState$.next({
        ...currentState,
        user,
        isAuthenticated: !!user
    });

    // Emit custom event
    window.dispatchEvent(new CustomEvent('user-state-changed', {
        detail: {user, isAuthenticated: !!user}
    }));
};

const addNotification = (notification) => {
    const currentState = notificationState$.value;
    const newNotifications = [...currentState.notifications, notification];

    notificationState$.next({
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length
    });

    // Emit custom event
    window.dispatchEvent(new CustomEvent('notification-added', {
        detail: notification
    }));
};

const markNotificationAsRead = (notificationId) => {
    const currentState = notificationState$.value;
    const updatedNotifications = currentState.notifications.map(n =>
        n.id === notificationId ? {...n, read: true} : n
    );

    notificationState$.next({
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length
    });
};

const emitEvent = (eventType, data) => {
    eventBus$.next({type: eventType, data});

    window.dispatchEvent(new CustomEvent(eventType, {
        detail: data
    }));
};

const subscribeToEvent = (eventType, callback) => {
    return eventBus$.pipe(
        filter(event => event.type === eventType),
        map(event => event.data)
    ).subscribe(callback);
};

export {
    // State streams
    userState$,
    notificationState$,
    eventBus$,
    cartState$,

    // Actions
    updateUser,
    addNotification,
    markNotificationAsRead,
    addToCart,
    removeFromCart,

    // Event utilities
    emitEvent,
    subscribeToEvent
};