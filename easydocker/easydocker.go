package main

import (
	"easydocker/etcdcli"
	"fmt"
	"log"
)

func main() {
	etcdCli := etcdcli.NewClient("http", "10.0.0.109", 2379)
	if v, err := etcdCli.Get("/queue/00000000000000002072"); err != nil {
		log.Fatal(err.Error())
	} else {
		switch v.(type) {
		case string:
			fmt.Println(v.(string))
		case []string:
			fmt.Println(v.([]string))
		default:
			log.Fatal("Unknow type %T", v)
		}
	}
}
