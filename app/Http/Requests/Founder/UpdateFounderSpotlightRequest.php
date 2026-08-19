<?php

namespace App\Http\Requests\Founder;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateFounderSpotlightRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'spotlight_one_liner' => ['nullable', 'string', 'max:120'],
            'spotlight_summary' => ['nullable', 'string', 'max:500'],
        ];
    }
}
