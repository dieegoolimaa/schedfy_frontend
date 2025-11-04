export enum ClientSource {
    /** Cliente que chegou pessoalmente sem agendamento prévio */
    WALK_IN = 'walk_in',

    /** Cliente que agendou online */
    ONLINE_BOOKING = 'online_booking',

    /** Cliente que ligou para agendar */
    PHONE = 'phone',

    /** Cliente indicado por outro cliente */
    REFERRAL = 'referral',

    /** Cliente que chegou através de redes sociais */
    SOCIAL_MEDIA = 'social_media',

    /** Cliente que encontrou através do Google */
    GOOGLE = 'google',

    /** Outra origem */
    OTHER = 'other',
}
