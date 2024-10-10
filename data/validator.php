<?php

class Validator{
    public static function sanear($datos){
        $saneados = [];
        foreach($datos as $key => $value){
            $saneados[$key] = htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
        }
        return $saneados;
    }

    public static function validarUsuario($data){
        $errors = [];

        //validar nombre
        if(!isset($data['nombre']) || empty(trim($data['nombre']))){
            $errors['nombre'] = "El nombre es necesario";
        }elseif(strlen($data['nombre']) < 2 || strlen($data['nombre']) > 50){
            $errors['nombre'] = "El nombre debe tener entre 2 y 50 caracteres";
        }elseif(!preg_match("/^[a-zA-ZáéíóúÁÉÍÓÚñÑ' -]+$/u", $data['nombre'])){
            $errors['nombre'] = "El nombre solo debe contener letras y espacios";
        }

        //validar correo
        if(!isset($data['email']) || empty(trim($data['email']))){
            $errors['email'] = "El email es necesario";
        }elseif(!filter_var($data['email'], FILTER_VALIDATE_EMAIL)){
            $errors['email'] = "El formato del email no es válido";
        }elseif(strlen($data['email']) > 255){
            $errors['email'] = "El email no puede exceder de 255 caracteres";
        }

        return $errors;
    }

    public static function validarPelicula($data){
        $errors = [];

        //validar nombre
        if(!isset($data['titulo']) || empty(trim($data['titulo']))){
            $errors['titulo'] = "El titulo es necesario";
        }elseif(strlen($data['titulo']) < 2 || strlen($data['titulo']) > 30){
            $errors['titulo'] = "El titulo debe tener entre 2 y 30 caracteres";
        } elseif (!preg_match("/^[a-zA-ZáéíóúÁÉÍÓÚñÑ' -0-9]+$/u", $data['titulo'])) {
            $errors['titulo'] = "El titulo solo debe contener letras y espacios";
        }

        //validar correo
        if(!isset($data['precio']) || empty(trim($data['precio']))){
            $errors['precio'] = "El precio es necesario";
        }elseif($data['precio'] < 0 ){
            $errors['titulo'] = "El precio no puede ser negativo";
        }elseif(!filter_var($data['precio'], FILTER_VALIDATE_FLOAT)){
            $errors['precio'] = "El formato del precio no es válido";
        }

        //validar ID_DIRECTOR
        if(!isset($data['id_director']) || empty(trim($data['id_director']))){
            $errors['id_director'] = "El id_director es necesario";
        }elseif($data['id_director'] < 0 ){
            $errors['id_director'] = "El id del director no puede ser negativo";
        }elseif(!filter_var($data['id_director'], FILTER_VALIDATE_INT)){
            $errors['id_director'] = "El formato del id de director no es válido";
        }

        return $errors;
    }



}