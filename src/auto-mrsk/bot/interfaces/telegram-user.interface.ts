/**
 * Интерфейс, описывающий пользователя Telegram
 */
export interface ITelegramUser {
  id: number;               // Идентификатор
  is_bot: boolean;          // Является ли ботом
  first_name: string;       // Имя
  last_name: string;        // Фамилия
  username: string;         // Имя пользователя
  language_code: string;    // Код языка
}
