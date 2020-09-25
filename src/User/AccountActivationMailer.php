<?php

/*
 * This file is part of Flarum.
 *
 * For detailed copyright and license information, please view the
 * LICENSE file that was distributed with this source code.
 */

namespace Flarum\User;

use Flarum\Http\UrlGenerator;
use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Event\Registered;
use Illuminate\Contracts\Mail\Mailer;
use Illuminate\Contracts\Translation\Translator;
use Illuminate\Mail\Message;

class AccountActivationMailer
{
    /**
     * @var SettingsRepositoryInterface
     */
    protected $settings;

    /**
     * @var Mailer
     */
    protected $mailer;

    /**
     * @var UrlGenerator
     */
    protected $url;

    /**
     * @var Translator
     */
    protected $translator;

    /**
     * @param \Flarum\Settings\SettingsRepositoryInterface $settings
     * @param Mailer $mailer
     * @param UrlGenerator $url
     * @param Translator $translator
     */
    public function __construct(SettingsRepositoryInterface $settings, Mailer $mailer, UrlGenerator $url, Translator $translator)
    {
        $this->settings = $settings;
        $this->mailer = $mailer;
        $this->url = $url;
        $this->translator = $translator;
    }

    public function handle(Registered $event)
    {
        $user = $event->user;

        if ($user->is_email_confirmed) {
            return;
        }

        $data = $this->getEmailData($user, $user->email);

        $body = 'Hi, '.$data['{username}'].'

Thank you for joining CoMEIn! We are excited to have you here. Once logged into CoMEIn, please send a request to the admin of the community you want to join with their required information. We hope you find this space useful and it motivates you to participate in discussions and address challenges in your personal and professional life. 

If you did sign-up on CoMEIn, simply click on the link below to activate your account. 
'.$data['{url}'].'

Also, please fill out "CoMEIn Users Demographic Information" form. Your information will remain secured and not be available on the CoMEIn website. The information you provide here will only assist in analyzing who the users are on the platform. It will only take 2-3 minutes to complete. Please enter the email you used to join CoMEIn. 

https://forms.illinois.edu/sec/2881271 
 
If you did not sign up please ignore this email.';

        $this->mailer->raw($body, function (Message $message) use ($user, $data) {
            $message->to($user->email);
            $message->subject('['.$data['{forum}'].'] '.$this->translator->trans('core.email.activate_account.subject'));
        });
    }

    /**
     * @param User $user
     * @param string $email
     * @return EmailToken
     */
    protected function generateToken(User $user, $email)
    {
        $token = EmailToken::generate($email, $user->id);
        $token->save();

        return $token;
    }

    /**
     * Get the data that should be made available to email templates.
     *
     * @param User $user
     * @param string $email
     * @return array
     */
    protected function getEmailData(User $user, $email)
    {
        $token = $this->generateToken($user, $email);

        return [
            '{username}' => $user->display_name,
            '{url}' => $this->url->to('forum')->route('confirmEmail', ['token' => $token->token]),
            '{forum}' => $this->settings->get('forum_title')
        ];
    }
}
